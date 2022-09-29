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

resource "aws_ecs_cluster" "cluster" {
  name = var.name
}

resource "aws_ecs_cluster_capacity_providers" "capacity_mapping" {
  cluster_name       = aws_ecs_cluster.cluster.name
  capacity_providers = [aws_ecs_capacity_provider.capacity_provider.name]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.capacity_provider.name
  }
}

# NOTE: Terraform may fail to delete/recreate this resource when the ASG ARN changes.
resource "aws_ecs_capacity_provider" "capacity_provider" {
  name = var.name

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.asg.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      maximum_scaling_step_size = 1
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = var.desired_capacity
    }
  }
}

resource "aws_autoscaling_group" "asg" {
  name                = "ecs-${var.name}"
  vpc_zone_identifier = var.subnets

  desired_capacity      = var.desired_capacity
  max_size              = var.max_capacity
  min_size              = var.min_capacity
  protect_from_scale_in = true

  launch_template {
    id      = aws_launch_template.template.id
    version = "$Latest"
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }

  tag {
    key                 = "Name"
    value               = "ecs-${var.name}"
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [
      desired_capacity,
    ]
  }
}

resource "aws_launch_template" "template" {
  name_prefix            = "ecs-${var.name}"
  image_id               = local.ami_ids[var.architecture][data.aws_region.current.name]
  instance_type          = var.instance_type
  key_name               = aws_key_pair.ssh_key.id
  vpc_security_group_ids = var.security_group_ids

  # Associate ECS-EC2 instances with this ECS cluster.
  user_data = base64encode("#!/bin/bash\necho ECS_CLUSTER=${var.name} >> /etc/ecs/ecs.config")

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }
}

resource "aws_key_pair" "ssh_key" {
  key_name   = "ecs-${var.name}-ssh"
  public_key = var.ssh_public_key
}

resource "aws_iam_role" "ecs_instance_role" {
  name = "ECSInstance"
  path = "/"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "ec2.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}
EOF	
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ECSInstance"
  role = aws_iam_role.ecs_instance_role.name
}

resource "aws_iam_role_policy_attachment" "ecs_instance_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
  role       = aws_iam_role.ecs_instance_role.name
}
