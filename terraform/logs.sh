#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HOST=$(terraform output -state "states/terraform_$BRANCH.tfstate" server_address)
USER=root
KEY=./ssh/terraform-deploy-branch-$BRANCH

chmod 600 $KEY

ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -T $USER@$HOST << EOF
tail -f /home/ubuntu/$BRANCH/logs/ai.log -f /home/ubuntu/$BRANCH/logs/game.log -f /home/ubuntu/$BRANCH/logs/worker.log -f /home/ubuntu/$BRANCH/logs/api.log
EOF
