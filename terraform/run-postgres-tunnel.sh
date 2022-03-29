#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HOST=$(terraform output -state "states/terraform_$BRANCH.tfstate" server_address)
USER=root
KEY=./ssh/terraform-deploy-branch-$BRANCH

ssh -i $KEY -L 54322:localhost:5432 $USER@$HOST