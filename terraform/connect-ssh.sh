#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i ssh/terraform-deploy-branch-$BRANCH root@$(terraform output -state "states/terraform_$BRANCH.tfstate" server_address)
