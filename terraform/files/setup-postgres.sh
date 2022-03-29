#!/bin/bash
sudo su - postgres << EOF
whoami
createuser -w ubuntu
psql -c "ALTER USER ubuntu WITH PASSWORD 'password';"
createdb -O ubuntu duelyst
EOF
