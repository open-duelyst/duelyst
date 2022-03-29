#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
terraform get
terraform plan -state "states/terraform_$BRANCH.tfstate" -var "branchName=$BRANCH"
terraform apply -state "states/terraform_$BRANCH.tfstate" -var "branchName=$BRANCH"
