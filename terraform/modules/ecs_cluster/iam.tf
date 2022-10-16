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

# Create an instance profile for the instances.
resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ECSInstance"
  role = aws_iam_role.ecs_instance_role.name
}

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
