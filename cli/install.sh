#!/bin/bash
# run npm install on CRM server
HOST=serpenti.counterplay.co
USER=root
FOLDER=serpenti

scp -o IdentitiesOnly=yes -o StrictHostKeyChecking=no ~/.npmrc $USER@$HOST:/$USER

ssh -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -T $USER@$HOST << EOF
cd $FOLDER
npm i -g coffeescript@1.8.0
npm install
EOF
