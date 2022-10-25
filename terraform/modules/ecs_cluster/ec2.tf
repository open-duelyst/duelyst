data "aws_region" "current" {}

locals {
  # This map contains Amazon Linux ECS-Optimized AMI IDs for both AMD64 and ARM64.
  # In order to support additional regions, add their AMI IDs to these maps.
  # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html
  ami_ids = {
    amd64 = {
      us-east-1 = "ami-07da26e39622a03dc"
    }
    arm64 = {
      us-east-1 = "ami-0df878b45cf41a8c2"
    }
  }
}

resource "aws_launch_template" "template" {
  name_prefix            = "ecs-${var.name}"
  image_id               = var.use_custom_ami ? var.custom_ami_id : local.ami_ids[var.architecture][data.aws_region.current.name]
  instance_type          = var.instance_type
  key_name               = aws_key_pair.ssh_key.id
  vpc_security_group_ids = var.security_group_ids

  # Associate ECS-EC2 instances with this ECS cluster.
  user_data = base64encode("#!/bin/bash\necho ECS_CLUSTER=${var.name} >> /etc/ecs/ecs.config\necho ECS_ENABLE_TASK_IAM_ROLE=true >> /etc/ecs/ecs.config")

  block_device_mappings {
    # https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/device_naming.html
    # https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/nvme-ebs-volumes.html#identify-nvme-ebs-device
    device_name = "/dev/xvda"

    ebs {
      # gp2 is billed at $0.10/GB/month.
      # gp3 is billed at $0.08/GB/month, plus $0.005 for each I/O operation per second over 3,000, plus $0.04 for each MB/s in throughput over 125.
      # Given that we hardly use disks, gp3 should result in a 20% cost reduction.
      # If we ever exceed the baseline for IOPS or Throughput, let's go back to gp2.
      volume_type           = "gp3"
      volume_size           = var.root_volume_size
      iops                  = 3000 # Cap IOPS at 3,000 to avoid overage charges.
      throughput            = 125  # Cap Throughput at 125MB/s to avoid overage charges.
      delete_on_termination = true
    }
  }

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }
}

resource "aws_key_pair" "ssh_key" {
  key_name   = "ecs-${var.name}-ssh"
  public_key = var.ssh_public_key
}
