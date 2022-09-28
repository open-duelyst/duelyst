# Staging Infrastructure

This directory contains Terraform to spin up a staging environment in AWS.

To get started, first follow the instructions in the general [Terraform README](../README.md).

Then populate `terraform.tfvars` with the keys and values from `variables.tf` and run `./terraform_init.sh`. This
is a helper script which automatically references the `config.aws.tfbackend` and `config.s3.tfbackend` files we created
previously.

Finally, run `terraform apply` to see the plan output and provision a staging environment.
