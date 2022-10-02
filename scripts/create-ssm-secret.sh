#!/usr/bin/env bash
# Creates a new secret in AWS SSM Parameter Store with KMS encryption.

# Helper function for error handling.
quit () {
	echo $1
	exit 1
}

# Parse arguments.
KMS_KEY_ID=$1
if [ -z $KMS_KEY_ID ]; then quit "First argument must be KMS_KEY_ID (UUID)!"; fi
NAME=$2
if [ -z $NAME ]; then quit "Second argument must be NAME e.g. /path/to/my/secret!"; fi
VALUE=$3
if [ -z $VALUE ]; then quit "Third argument must be VALUE e.g. my-secret!"; fi

# Create the secret.
aws ssm put-parameter --type SecureString --key-id $KMS_KEY_ID --name $NAME --value $VALUE
