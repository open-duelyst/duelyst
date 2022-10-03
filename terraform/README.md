# Terraform

This directory contains [infrastructure as code](https://en.wikipedia.org/wiki/Infrastructure_as_code) for creating
staging and production environments in AWS. For instructions on creating a development environment, see
[here](../CONTRIBUTING.md#dev-environment).

To get started, install [Terraform](https://www.terraform.io/downloads) for your OS. At the time of writing, the latest
version is 1.3.0, though we will be managing version constraints in the code itself.

## Getting Started

First, create an AWS account. This will create a root user which can be used to create other resources. Configure
Multi-Factor Authentication (MFA) on the root user to prevent unauthorized access.

Before we can use Terraform, we need to create two prerequisite resources by hand: an IAM user, and an S3 bucket.

## Creating an IAM User

Since we don't want to generate access keys for the root user, we should create a limited IAM user and access keys.

Create a `terraform` user with an Access Key (no password), and attach [this IAM policy](iamPolicy.json) to the user.

This policy includes all permissions needed to create a staging environment.

In the final step, copy the Access Key and Secret Key into a password manager. You will need these later to use in
`terraform.tfvars` files which are ignored by Git in this repo.

## Creating an S3 bucket to store Terraform remote state

In order to avoid local state, we need to create an S3 bucket for Terraform to put its state files in. Since there is a
bit of a "chicken and egg" problem with the remote state provider configuration and the bucket itself, go ahead and
create this manually in the UI. Give it a _globally unique_ name, and leave all other settings at the default values.

## Initializing Providers

Once you have a user, an access key, a secret key, and an S3 bucket, you can initialize and use Terraform.

To do this, create two more configuration files:

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
the required providers. These files are ignored in Git to avoid the risk of accidentally committing your secrets.

When this command succeeds, you're ready to use Terraform to provision a staging environment. See the `staging`
directory for more info.
