#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HOST=$(terraform output -state "states/terraform_$BRANCH.tfstate" server_address)
USER=root
KEY=./ssh/terraform-deploy-branch-$BRANCH
FOLDER=$(git rev-parse --abbrev-ref HEAD)

chmod 600 $KEY

scp -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no ~/.npmrc $USER@$HOST:/root

rsync -avzd --delete-before -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" \
--include="/scripts/helpers.js" \
--include="/scripts/generate_packages.js" \
--include="/scripts/create_bot_users.js" \
--filter=":- .gitignore" --exclude=".git" \
--exclude="/app/original_resources" --exclude-from=".deployignore" \
../ $USER@$HOST:/root/$FOLDER

ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -T $USER@$HOST << EOF
cd $FOLDER
mkdir -p node_modules/@counterplay
EOF

ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -T $USER@$HOST << EOF
cd $FOLDER
forever stopall
npm install
npm rebuild node-sass
NODE_ENV=$BRANCH npm run migrate:latest
# NODE_ENV=$BRANCH node ./scripts/create_bot_users.js
NODE_ENV=$BRANCH API_URL=" " npm run minify
mkdir -p logs
#NODE_ENV=$BRANCH forever start -o logs/ai.log bin/single_player
NODE_ENV=$BRANCH forever start -o logs/api.log bin/api
NODE_ENV=$BRANCH forever start -o logs/game.log bin/game
NODE_ENV=$BRANCH forever start -o logs/worker.log bin/worker
EOF
