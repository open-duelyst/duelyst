# Terraform

This directory contains [infrastructure as code](https://en.wikipedia.org/wiki/Infrastructure_as_code) for creating
staging and production environments. For development environments, see [here](../CONTRIBUTING.md#dev-environment).

To get started, install [Terraform](https://www.terraform.io/downloads) for your OS. At the time of writing, the latest
version is 1.3.0, though we will be managing version constraints in the code itself.

## Getting Started

First, create an AWS account. This will create a root user which can be used to create other resources. Configure
Multi-Factor Authentication (MFA) on the root user to prevent unauthorized access.

Before we can use Terraform, we need to create two prerequisite resources by hand: an IAM user, and an S3 bucket.

#### Creating an IAM User

Since we don't want to generate access keys for the root user, we should create a limited IAM user and access keys.

Create a `terraform` user with an Access Key (no password), and attach the following policy to the user:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeAccountAttributes",
                "ec2:DescribeInstanceCreditSpecifications",
                "ec2:DescribeInstanceEventNotificationAttributes",
                "ec2:DescribeInstanceEventWindows",
                "ec2:DescribeInstanceStatus",
                "ec2:DescribeInstanceTypeOfferings",
                "ec2:DescribeInstanceTypes",
                "ec2:DescribeInstances",
                "ec2:DescribeLaunchTemplateVersions",
                "ec2:DescribeLaunchTemplates",
                "ec2:DescribeTags",
                "ec2:DescribeVolumeStatus",
                "ec2:DescribeVolumes",
                "ec2:DescribeVolumesModifications",
                "ec2:DescribeVpcs",
                "sns:GetSubscriptionAttributes"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:DeleteAlarms",
                "cloudwatch:DescribeAlarms",
                "cloudwatch:ListTagsForResource",
                "cloudwatch:PutMetricAlarm",
                "iam:PassRole",
                "s3:ListBucket",
                "sns:CreateTopic",
                "sns:DeleteTopic",
                "sns:GetTopicAttributes",
                "sns:ListTagsForResource",
                "sns:SetTopicAttributes",
                "sns:Subscribe"
            ],
            "Resource": [
                "arn:aws:cloudwatch:*:YOUR-AWS-ACCOUNT-ID:alarm:*",
                "arn:aws:iam::YOUR-AWS-ACCOUNT-ID:role/*",
                "arn:aws:s3:::YOUR-TERRAFORM-S3-BUCKET",
                "arn:aws:sns:*:YOUR-AWS-ACCOUNT-ID:*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:AttachVolume",
                "ec2:CreateTags",
                "ec2:CreateVolume",
                "ec2:DeleteTags",
                "ec2:DeleteVolume",
                "ec2:DescribeInstanceAttribute",
                "ec2:DescribeVolumeAttribute",
                "ec2:DetachVolume",
                "ec2:GetLaunchTemplateData",
                "ec2:ModifyVolume",
                "ec2:ModifyVolumeAttribute",
                "ec2:RunInstances",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:TerminateInstances",
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:ec2:*:YOUR-AWS-ACCOUNT-ID:instance/*",
                "arn:aws:ec2:*:YOUR-AWS-ACCOUNT-ID:launch-template/*",
                "arn:aws:ec2:*:YOUR-AWS-ACCOUNT-ID:network-interface/*",
                "arn:aws:ec2:*:YOUR-AWS-ACCOUNT-ID:security-group/*",
                "arn:aws:ec2:*:YOUR-AWS-ACCOUNT-ID:subnet/*",
                "arn:aws:ec2:*:YOUR-AWS-ACCOUNT-ID:volume/*",
                "arn:aws:ec2:*::image/*",
                "arn:aws:s3:::YOUR-TERRAFORM-S3-BUCKET/*"
            ]
        }
    ]
}
```

This is a policy of "least privilege" which enables the permissions needed to create a staging environment.

In the final step, copy the Access Key and Secret Key into a password manager. You will need these later to use in
`terraform.tfvars` files which are ignored by Git in this repo.

#### Creating an S3 bucket to store Terraform remote state

In order to avoid local state, we need to create an S3 bucket for Terraform to put its state files in. Since there is a
bit of a "chicken and egg" problem with the remote state provider configuration and the bucket itself, go ahead and
create this manually in the UI. Give it a _globally unique_ name, and leave all other settings at the default values.

#### Initializing Providers

Once you have a user, an access key, a secret key, and an S3 bucket, you can initialize and use Terraform.

Terraform makes it somewhat cumbersome to genericize backend initialization in a way which allows each user to
set their own AWS region and globally-unique S3 bucket name. In order to do this, we need to create two files:

`staging/config.aws.tfbackend`:
```
region = "your-preferred-aws-region"
access_key = "your-access-key"
secret_key = "your-secret-key"
```

`staging/config.s3.tfbackend`:
```
region = "your-preferred-aws-region"
bucket = "your-globally-unique-bucket-name"
```

Once these files are in place, you can run `terraform_init.sh` in the `staging` directory to initialize Terraform and
the required providers.

When this command succeeds, you're ready to use Terraform to provision a staging environment. See the `staging`
directory for more info.

## Notes on Cost Management

For notes on resource utilization, see [ARCHITECTURE.md](../ARCHITECTURE.md#resource-utilization).

The following table summarizes the above resource utilization estimations for 500 CCU load:

| Service  | vCPU | RAM   | Network Out | Storage |
|----------|------|-------|-------------|---------|
| API      | 2.50 | 500MB | 200 KBps    | 5GB     |
| Game     | 1.00 | 300MB | 100 KBps    | 5GB     |
| SP       | 1.00 | 300MB | 100 KBps    | 5GB     |
| Worker   | 2.00 | 300MB | Unbilled    | 5GB     |
| Postgres | 1.00 | 100MB | Unbilled    | 1GB     |
| Redis    | 1.50 | 100MB | Unbilled    | 1GB     |

AWS EC2 instances:

- Instance types:
	- Based on the above data, 2 vCPUs and 1GB RAM would likely suffice for each service
	- `t4g.micro` Spot instances have 2 vCPUs and 1GB RAM, and are billed at $0.0084/hour on-demand
		- The `g` in `t4g` indicates AWS Gravitron (ARM) processors, which are about 20% cheaper than x86
		- Spot Instances (pre-emptible) are further discounted by 70%, for a final rate of $0.0025/hour
			- See https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html
			- Note: At peak load, vCPU will be limited after a 2h24m burst; scaling up will prevent this
	- With 6 `t4g.micro` Spot Instances, we'd be billed $0.36/hour or $10.95/month.
- Storage:
	- The first 30GB of EBS storage is free for 1 year
	- Amazon's `gp3` disk type in Elastic Block Store is the most economical option
	- Storage is billed at $0.08/GB-month ($3.84/month for 8GB x 6 services)
  - There are additional charges when exceeding 3,000 IOPS or 125MB/s transfer speed
		- Given our scale, it is very unlikely that we will hit these thresholds
- Data Transfer:
	- The first 100GB/month is free indefinitely, and the next 9.1TB/month is billed at $0.09/GB
	- At peak load, we'd egress 400KB/second, 1.37GB/hour, or 1002GB/month.
		- If this number seems high, it's because it assumes we have 500 players at all times, 24/7
		- In reality, we'd likely see sine-wave concurrency over each day, likely averaging half this number
	- With 400GB of billed data transfer, we'd pay $36/month.
	- Additional work can be done to reduce the amount of network egress in API, Game, and SP
Total:
	- Using 6 `t4g.micro` instances with 8GB storage and current network egress might cost around $50/month
	- This number will be significantly lower (as low as $14.79/month) with less user traffic

Other Compute Systems:

- AWS ECS-EC2
	- Billed at the same rate as EC2, but allows us to provide containers instead of provisioning VMs
- AWS ECS-Fargate
  - Fargate pods are billed at $0.03238/vCPU-hour plus $0.00356/GB-hour for memory
	- Fargate Spot pods are billed at $0.012144/vCPU-hour plus $0.0013335/GB-hour for memory
	- Fargate pod sizing has additional restrictions: with 2 vCPUs, you must allocate at least 4GB of memory
	- For 6 Spot pods with 2 vCPU and 4GB of memory, this would cost $0.18/hour or $129.75/month.
		- This price does not include Data Transfer or Storage billing, so ECS-Fargate is not a good fit for the project.
- AWS EKS
	- Creating an EKS cluster generates a $0.10/hour charge, making the base price $73/mo
	- This price does not include Compute, Data Transfer, or Storage billing, so EKS is not a good fit for the project.
- AWS Elastic Beanstalk (TBD)

Managed Postgres:

- AWS RDS (TBD)

Managed Redis:

- AWS Elasticache (TBD)

S3 Bucket (Standard Tier) to store Terraform state:

- The first year is free (up to 5GB stored).
- Storage costs:
	- $0.023/GB-month (virtually free for ~64KB).
- Per-Request costs:
	- $0.004/1,000 GETs and $0.05/1,000 PUTs (a little over $0.01/month for 200+200/month).
- Data Transfer costs:
	- Free up to 100GB/month.
- Total costs:
	- Approximately $0.01/month.
