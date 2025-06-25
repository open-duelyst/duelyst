#!/usr/bin/env bash
# Lints Terraform code with tflint.
for dir in $(find terraform | grep '\.tf$' | xargs dirname | sort -u); do
	if [[ $dir == "terraform/modules"* ]]; then
		# Ignore provider rules in modules.
		tflint --disable-rule=terraform_required_providers \
			--disable-rule=terraform_required_version --chdir=$dir
	else
		tflint --chdir=$dir
	fi
done
