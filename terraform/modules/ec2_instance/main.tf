# Create an on-demand EC2 instance.
# Defaults to a t4g micro running Ubuntu 20.04.
data "aws_region" "current" {}

locals {
  # This map contains the official Ubuntu 20.04 LTS AMI IDs for both AMD64 and ARM64.
  # In order to support additional regions, add their AMI IDs to these maps.
  # Find Ubuntu AMIs here: https://cloud-images.ubuntu.com/locator/ec2/
  ami_ids = {
    amd64 = {
      eu-central-1 = "ami-0b1077098d8cb5431"
      eu-north-1   = "ami-009309b93e46c63ea"
      eu-south-1   = "ami-0d3bc945163bd2580"
      eu-west-1    = "ami-052ed0ea33bec8c6b"
      eu-west-2    = "ami-0784ce9cd4633006d"
      eu-west-3    = "ami-05d91095ca9ecd4b8"
      us-east-1    = "ami-0c1704bac156af62c"
      us-east-2    = "ami-0a23d90349664c6ee"
      us-west-1    = "ami-0f42d9714d85eeb8b"
      us-west-2    = "ami-07eeacb3005b9beae"
    }
    arm64 = {
      eu-central-1 = "ami-01453eb88ba6b047b"
      eu-north-1   = "ami-0290473e4735a14c6"
      eu-south-1   = "ami-03e4a0b787007e984"
      eu-west-1    = "ami-03469ea204ef7a8bc"
      eu-west-2    = "ami-00a2da48a9eaf4ca5"
      eu-west-3    = "ami-0ed9afa3b50d7da65"
      us-east-1    = "ami-0bfa1783225ce047b"
      us-east-2    = "ami-0041785de9fa3bd2b"
      us-west-1    = "ami-0437a136dfcc22406"
      us-west-2    = "ami-01e04eaed3cca6137"
    }
  }
}

# TODO: https://aws.amazon.com/premiumsupport/knowledge-center/cloudwatch-memory-metrics-ec2/
resource "aws_instance" "instance" {
  ami           = local.ami_ids[var.architecture][data.aws_region.current.name]
  instance_type = var.instance_type
}
