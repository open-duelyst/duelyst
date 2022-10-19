# Provisioning Infrastructure with Terraform

## Cloud Providers

OpenDuelyst has components in both Google Cloud (Firebase Realtime Database)
and AWS (ECS, LBs, Postgres, Redis, and more).

For the Firebase Realtime Database, there isn't much Terraform support for
creating and managing resources currently. You can find instructions for
manually setting up a Firebase Realtime Database in the Contributor Guide
[here](https://github.com/open-duelyst/duelyst/blob/main/docs/CONTRIBUTING.md#setting-up-firebase).

For AWS components, all resources are fully managed in
[Terraform](https://www.terraform.io), which is an
[infrastructure-as-code](https://en.wikipedia.org/wiki/Infrastructure_as_code)
tool for provisioning and configuring infrastructure.

## Getting Started

First, create an AWS account. This will create a root user which can be used to
create other resources. Configure Multi-Factor Authentication (MFA) on the root
user to prevent unauthorized access.

Before we can use Terraform, we need to create two prerequisite resources by
hand: an IAM user, and an S3 bucket.

## Creating an IAM User

Since we don't want to generate access keys for the root user, we should create
a limited IAM user and access keys.

Create a `terraform` user with an Access Key (no password), and attach
[this IAM policy](iamPolicy.json) to the user.

This policy includes all permissions needed to create a staging environment.

In the final step, copy the Access Key and Secret Key into a password manager.
You will need these later to use in `terraform.tfvars` files which are ignored
by Git in this repo.

## Creating an S3 bucket to store Terraform remote state

In order to avoid local state, we need to create an S3 bucket for Terraform to
put its state files in. Since there is a bit of a "chicken and egg" problem
with the remote state provider configuration and the bucket itself, go ahead
and create this manually in the UI. Give it a _globally unique_ name, and leave
all other settings at the default values.

## Initializing Terraform for your AWS account

Once you have a user, an access key, a secret key, and an S3 bucket, you can
initialize and use Terraform.

To do this, create two configuration files:

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

These files are ignored in Git to avoid the risk of accidentally committing
your secrets, and provider configuration is not stored in the Terraform state.

Once these files are in place, you can run `staging/terraform_init.sh`, which
is a helper script which uses the `.tfbackend` config files we created earlier
to configure and initialize the Terraform AWS provider.

When this command succeeds, you're ready to use Terraform to provision a
staging environment.

## Creating Secrets in AWS SSM Parameter Store

Secrets like passwords should not be committed to Git or stored in Terraform,
since the latter would store your secrets in plaintext in Terraform's state
bucket. Instead, the following keys need to be created in AWS SSM Parameter
Store:

```
/duelyst/staging/firebase/client-email # From serviceAccountKey.json
/duelyst/staging/firebase/legacy-token
/duelyst/staging/firebase/private-key  # From serviceAccountKey.json
/duelyst/staging/postgres/connection-string
/duelyst/staging/postgres/password
```

You can use `scripts/create-ssm-secret.sh` for this purpose. For the Firebase
private key, you may find it easier to put the private key in a file, and
reference it as `file://myPrivateKey.txt` in the script.

## Configuring Terraform for your AWS Account

Once the providers are configured and secrets have been created in AWS SSM
Parameter Store, one final round of user-specific configuration needs to be
added to a `staging/terraform.tfvars` file. This file is also ignored by Git,
so the values specific to your AWS account don't need to be committed.

Here is a partial example of a `terraform.tfvars` file:

```
aws_region         = "us-east-2"
assets_bucket_name = "my-bucket"
firebase_project   = "duelyst-12345"
firebase_url       = "https://duelyst-12345-default-rtdb.firebaseio.com/"
```

To fully populate this file, you'll need several pieces of information
regarding your AWS account, domain names, and Firebase project. For a list of
the keys expected in this file, look at `staging/variables.tf` where they are
defined.

## Creating a Staging Envinroment

Once you've finished all of the above steps, you can provision a staging
environment:

```
terraform apply
```

This command will show you a JSON-like representation of every resource to be
created, and prompt you to confirm. If you encounter any errors regarding
permissions, revisit your IAM user's policy to determine which permissions are
missing. If you encounter other errors, consider filing a bug in our
[Issues](https://github.com/open-duelyst/duelyst/issues).

Once Terraform finishes creating resources, you should be able to reach the API
server at the domain you provided as `staging_domain_name` in the
`terraform.tfvars` file. This will point to a load balancer which redirects
requests for static assets to CloudFront and S3, and load balances application
traffic to the API, Game, SP, and Worker containers in AWS ECS.
