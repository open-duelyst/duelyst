resource "aws_iam_user" "user" {
  name = var.name
  path = "/"
}

resource "aws_iam_user_policy" "policy" {
  name = var.name
  user = aws_iam_user.user.name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ${jsonencode(var.allowed_actions)},
      "Effect": "Allow",
      "Resource": "${var.allowed_resource}"
    }
  ]
}
EOF
}
