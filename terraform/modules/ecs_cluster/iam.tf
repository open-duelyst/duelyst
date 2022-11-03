#
# Instance Role & Policies
#

# Create a role for the instances.
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

# Create an instance profile for the instances.
resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ECSInstance"
  role = aws_iam_role.ecs_instance_role.name
}

# Create a policy which allows uploads to S3.
resource "aws_iam_policy" "s3_upload_policy" {
  name   = "S3Uploader"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

# Attach the S3 uploads policy to the instance role.
resource "aws_iam_role_policy_attachment" "ecs_instance_s3_policy_attachment" {
  policy_arn = aws_iam_policy.s3_upload_policy.arn
  role       = aws_iam_role.ecs_instance_role.name
}

# Attach the pre-defined AmazonEC2ContainerServiceforEC2Role to the instance role.
resource "aws_iam_role_policy_attachment" "ecs_instance_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
  role       = aws_iam_role.ecs_instance_role.name
}

# Attach the pre-defined CloudWatchAgentServerPolicy policy to the instance role.
resource "aws_iam_role_policy_attachment" "ecs_instance_cw_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  role       = aws_iam_role.ecs_instance_role.name
}

# Create a policy which allows managing EBS devices.
/* Disabled: Was used for testing rexray/ebs Docker plugin.
resource "aws_iam_policy" "ebs_management_policy" {
  name   = "EBSManager"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ec2:AttachVolume",
        "ec2:CreateVolume",
        "ec2:CreateSnapshot",
        "ec2:CreateTags",
        "ec2:DeleteVolume",
        "ec2:DeleteSnapshot",
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes",
        "ec2:DescribeVolumeAttribute",
        "ec2:DescribeVolumeStatus",
        "ec2:DescribeSnapshots",
        "ec2:CopySnapshot",
        "ec2:DescribeSnapshotAttribute",
        "ec2:DetachVolume",
        "ec2:ModifySnapshotAttribute",
        "ec2:ModifyVolumeAttribute",
        "ec2:DescribeTags"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

# Attach the EBS management policy to the instance role.
resource "aws_iam_role_policy_attachment" "ecs_instance_ebs_policy_attachment" {
  policy_arn = aws_iam_policy.ebs_management_policy.arn
  role       = aws_iam_role.ecs_instance_role.name
}
*/

#
# Task Role & Policy
#

# Create a role for ECS tasks.
resource "aws_iam_role" "task_role" {
  name = "ECSTask"
  path = "/"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

# Create a policy for ECS tasks.
resource "aws_iam_policy" "task_policy" {
  name   = "ECSTask"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetAuthorizationToken",
        "ecr:GetDownloadUrlForLayer",
        "kms:Decrypt",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "secretsmanager:GetSecretValue",
        "ssm:GetParameters"
      ],
      "Resource": ["*"]
    }
  ]
}
EOF
}

# Attach the task policy to the task role.
resource "aws_iam_role_policy_attachment" "task_policy_attachment" {
  policy_arn = aws_iam_policy.task_policy.arn
  role       = aws_iam_role.task_role.name
}
