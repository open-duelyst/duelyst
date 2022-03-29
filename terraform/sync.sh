#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HOST=$(terraform output -state "states/terraform_$BRANCH.tfstate" server_address)
USER=root
KEY=./ssh/terraform-deploy-branch-$BRANCH
FOLDER=$(git rev-parse --abbrev-ref HEAD)

chmod 600 $KEY

rsync -avzd --delete-before -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" \
--include="/scripts/helpers.js" --include="/scripts/generate_packages.js" --include="/scripts/create_bot_users.js" \
--filter=":- .gitignore" --exclude=".git" --exclude="/app/original_resources" --exclude-from=".deployignore" \
../ $USER@$HOST:/home/$USER/$FOLDER