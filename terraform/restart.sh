#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HOST=$(terraform output -state "states/terraform_$BRANCH.tfstate" server_address)
USER=root
KEY=./ssh/terraform-deploy-branch-$BRANCH
FOLDER=$(git rev-parse --abbrev-ref HEAD)

chmod 600 $KEY

ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -T $USER@$HOST << EOF
cd $FOLDER
forever stopall
mkdir -p logs
# NODE_ENV=$BRANCH forever start -o logs/ai.log bin/single_player
NODE_ENV=$BRANCH forever start -o logs/api.log bin/api
NODE_ENV=$BRANCH forever start -o logs/game.log bin/game
NODE_ENV=$BRANCH forever start -o logs/worker.log bin/worker
EOF
