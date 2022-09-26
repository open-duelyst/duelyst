#!/usr/bin/env bash

# The code to analyze should be provided as the first argument, e.g. ./eslint-analyzer.sh app/common
target=$1

# Generate a JSON report of linting errors.
node node_modules/eslint/bin/eslint.js --format json --quiet $target > eslint-results.json

# Count top 15 linting errors by type.
echo "Top 15 linting errors by type:"
jq '.[] | .messages | .[] |.ruleId' eslint-results.json | sort | uniq -c | sort -r | head -15

# Count top 15 linting errors by file.
echo -e "\nTop 15 linting errors by file:"
jq -c 'sort_by(.errorCount) | reverse | .[] | {errors: .errorCount, file: .filePath}' eslint-results.json | head -15

# Clean up after ourselves.
rm eslint-results.json
