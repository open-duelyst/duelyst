#!/usr/bin/env python3
import boto3

# Get AWS account ID.
sts_client = boto3.client('sts')
account_id = sts_client.get_caller_identity().get('Account')

# Find untagged and non-latest ECR images.
ecr_client = boto3.client('ecr-public')
images_to_delete = dict()
for svc in ['api', 'game', 'migrate', 'sp', 'worker']:
    images_to_delete[svc] = list()
    images = ecr_client.describe_images(
        registryId=account_id,
        repositoryName='duelyst-{}'.format(svc),
    ).get('imageDetails')
    for img in images:
        if 'imageTags' in img.keys() and 'latest' in img.get('imageTags'):
            continue
        images_to_delete[svc].append(img.get('imageDigest'))

# Prune ECR images.
for svc, images in images_to_delete.items():
    if images:
        print('Deleting images for service {}: {}'.format(svc, images))
        resp = ecr_client.batch_delete_image(
            registryId=account_id,
            repositoryName='duelyst-{}'.format(svc),
            imageIds=[{'imageDigest': i} for i in images],
        )
        failures = resp.get('failures')
        if failures:
            print(resp.get('ResponseMetadata').get('HTTPStatusCode'))
            print('Failures: {}'.format(failures))
            exit(1)

print('Done!')
