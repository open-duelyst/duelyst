#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
terraform destroy -state "states/terraform_$BRANCH.tfstate" -var "branchName=$BRANCH"