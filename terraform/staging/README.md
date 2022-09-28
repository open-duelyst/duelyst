# Staging Infrastructure

This directory contains Terraform to spin up a staging environment in AWS.

To get started, first follow the instructions in the general [Terraform README](../README.md).

Then populate `terraform.tfvars` with the keys and values from `variables.tf`, run `./terraform_init.sh`, and run
`terraform apply`.
