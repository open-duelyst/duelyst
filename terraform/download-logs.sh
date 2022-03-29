#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HOST=$(terraform output -state "states/terraform_$BRANCH.tfstate" server_address)
USER=root
KEY=./ssh/terraform-deploy-branch-$BRANCH

chmod 600 $KEY

scp -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no $USER@$HOST:/home/ubuntu/$BRANCH/logs/ai.log ai.log
scp -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no $USER@$HOST:/home/ubuntu/$BRANCH/logs/api.log api.log
scp -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no $USER@$HOST:/home/ubuntu/$BRANCH/logs/worker.log worker.log
scp -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no $USER@$HOST:/home/ubuntu/$BRANCH/logs/game.log game.log
