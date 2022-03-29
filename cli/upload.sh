#!/bin/bash
# upload the source code to CRM server
HOST=serpenti.counterplay.co
USER=root
FOLDER=serpenti

rsync -avzd --delete-before -e "ssh -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" \
--include="/scripts/helpers.js" \
--filter=":- .gitignore" --exclude=".git" \
--exclude="/app/resources" --exclude="/app/original_resources" \
--exclude-from=".deployignore" \
../ $USER@$HOST:/$USER/$FOLDER