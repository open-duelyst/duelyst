#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
mkdir -p ssh
ssh-keygen -b 2048 -f ssh/terraform-deploy-branch-$BRANCH -t rsa -N '' -C $BRANCH
