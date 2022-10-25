# Provide these variables in a terraform.tfvars file.

# The AWS region determines where your resources will be created.
# There is a list of available regions here:
# https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions
variable "aws_region" {
  type = string
}

# By default, we use Amazon's ECS-Optimized AMI.
# You may want to use a custom image for a variety of reasons, such as reducing
# the default disk size of 30GB.
# To create custom AMIs, use Amazon's open source tool here:
# https://github.com/aws/amazon-ecs-ami/
variable "custom_ami_id" {
  type    = string
  default = ""
}

# The AWS Access Key ID for your Terraform IAM user.
# This is only used in the provider configuration, and will not be stored in
# the Terraform state.
variable "aws_access_key" {
  type = string
}

# The AWS Secret Access Key for your Terraform IAM user.
# This is only used in the provider configuration, and will not be stored in
# the Terraform state.
variable "aws_secret_key" {
  type = string
}

# The SSH public key to attach to your ECS-EC2 instances.
variable "ssh_public_key" {
  type = string
}

# The S3 bucket name for storing Duelyst static assets.
# This name must be globally unique across all of AWS.
variable "assets_bucket_name" {
  type = string
}

# The S3 bucket name for storing Duelyst game replays.
# This name must be globally unique across all of AWS.
variable "replays_bucket_name" {
  type = string
}

# The domain name for the staging API service, e.g. play.duelyst.com.
variable "staging_domain_name" {
  type = string
}

# The domain name for the CDN, e.g. cdn.duelyst.com.
variable "cdn_domain_name" {
  type = string
}

# The first of three availability zones to use when creating AWS resources.
# You can find a list of Availability Zones you can use by following these
# instructions:
# https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe
# Note that availability zones are randomized for each AWS account. In other
# words, us-east-1a in one account may not be the same datacenter as us-east-1a
# in another AWS account.
variable "first_availability_zone" {
  type = string
}

# The second of three availability zones to use when creating AWS resources.
# You can find a list of Availability Zones you can use by following these
# instructions:
# https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe
# Note that availability zones are randomized for each AWS account. In other
# words, us-east-1a in one account may not be the same datacenter as us-east-1a
# in another AWS account.
variable "second_availability_zone" {
  type = string
}

# The third of three availability zones to use when creating AWS resources.
# You can find a list of Availability Zones you can use by following these
# instructions:
# https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe
# Note that availability zones are randomized for each AWS account. In other
# words, us-east-1a in one account may not be the same datacenter as us-east-1a
# in another AWS account.
variable "third_availability_zone" {
  type = string
}

# The name of your Firebase project.
# This is not the URL, but the shorthand project name e.g. "duelyst-12345".
# This is used for Firebase authentication flows in the backend services.
variable "firebase_project" {
  type = string
}

# The URL of your Firebase Realtime Database.
# This must end in ".firebaseio.com/", including the trailing slash.
variable "firebase_url" {
  type = string
}

# The name of the user to create in the RDS Postgres database instance.
# This should match the username used in the "postgres_connection_string"
# config value in the app.
variable "database_user" {
  type = string
}

# The 8-character, alphanumeric ID for your public ECR registry.
# This is used to tell ECS services where to obtain container images.
variable "ecr_registry_id" {
  type = string
}

# Cloudwatch Alarms will be routed to this email address.
variable "email_address_for_alarms" {
  type = string
}
