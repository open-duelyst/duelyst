# Deploying a new version of OpenDuelyst

This doc will cover the steps required to build, upload, and deploy a new
release of the game. Ultimately, the goal is to automate these steps through
Github Actions or other automation. This work is being tracked in
https://github.com/open-duelyst/duelyst/issues/76.

Most of these steps require some form of elevated permissions. For example,
creating tags and releases or uploading desktop clients requires maintainer or
owner permissions on the Git repo. Publishing containers, deploying backend
services, and uploading web client builds requires AWS access.

These can be safely automated by storing any necessary credentials in Github
Secrets:

- https://docs.github.com/en/actions/security-guides/encrypted-secrets
- https://docs.github.com/en/github-ae@latest/rest/actions/secrets

Once the relevant secrets are in Github, we can create and test new Github
Actions to perform these steps on our behalf.

In the meantime, the steps to deploy the game are recorded below.

## Requirements

In order to complete this process, the following things are required:

- A Mac computer (for building the Mac client)
- Docker Desktop (for building container images)
- Permissions to create Releases in Github
- Permissions to publish container images to AWS ECR
- Permissions to deploy AWS ECS services
- Permissions to upload files to AWS S3 buckets
- Permissions to create cache invalidations in AWS CloudFront distributions

## Step 1: Tag and Create a Release

This step requires maintainer permissions or above in the Github repo.

The first things we need are a Git tag and a Github release. To create a new
tag, first create a new branch. In this branch, update the version number in the
following files:

```
version.json
package.json
desktop/package.json
```

Merge the PR, then check out and pull the `main` branch locally. You should now
be on the merge commit which bumped the version. At this point, create a new Git
tag with `git tag <version>`, then push it with `git push --tags origin`.

Once the new tag exists, you can create a new Github release here:
https://github.com/open-duelyst/duelyst/releases/new

Choose the tag you just created, add a title for the release, include a summary
of changes in the description, then click 'Publish Release'. We'll revisit this
later to attach desktop clients.

**To automate this step:**

- Create a new Github Action which watches for changes to `version.json` on
  `main`
- Have the Github Action validate that all three files have been updated with
  the same version number as `version.json`
- Have the Github Action create the corresponding tag and release
  - The tag name can be determined by simply parsing `version.json`, e.g.
    `1.2.3`
  - The release title can be `v<version>`, e.g. `v1.2.3`
  - The release body can be automatically generated. In the UI, Github provides
    a "Generate release notes" button. There must be some API/CLI equivalent we
    can use from Github Actions as well. If not, we can use something like
    `git log --format=oneline <old-tag>..<new-tag>` to generate the contents.

## Step 2: Create and Publish Docker Containers

This step requires ECR permissions in AWS.

On a Mac or Linux system, install and configure the AWS CLI. You can confirm
that it works by running `aws sts get-caller-identity`.

Once this is done, you can use a shell script to build and publish containers
for all Duelyst services:

```bash
# From the repo root:
scripts/release_containers.sh <version> <ecr-registry-id>
```

With the arguments populated, the command might look like this:
```
scripts/release_containers.sh 1.2.3 abcd1234
```

The script will first build the base Node.js image used by all services, and
will then build per-service images on top of it. If the builds succeed, the
resulting images will then be uploaded to AWS ECR using the AWS CLI. Each image
will be uploaded into its own public ECR "repository" inside the provided ECR
"registry" (which is unique per AWS account). These repository values match
those used in our Terraform configuration.

**To automate this step:**

- Add an IAM user, role, and policy via Terraform which allows uploading images
  to ECR
- Generate access keys for the IAM user, and place them in Github Secrets
- Create a new Github Action which triggers when a new release is created
- Have the Github Action run the above script

## Step 3: Deploy Backend Services

This step requires ECS and EC2 permissions in AWS, but would not require any
permissions if automated.

The deployed version of each backend service is currently managed in Terraform
[here](../terraform/staging/ecs.tf). Update the `deployed_version` attributes
for the backend services, and then run `terraform apply` to create new task
definitions and initiate deployments.

ECS is still missing some configuration to fully automate deployments. We would
need extra capacity (1 more instance is enough) to allow for graceful
deployments with no downtime, as well as configuration to automatically shut
down old tasks once new tasks are healthy.

Until this configuration is in place, we can manually kick ECS services to get
things deployed:

- In the AWS ECS UI, view the running tasks in the cluster and stop any old
  tasks. This can be done a few at a time to avoid downtime, given enough
  capacity.
- Once all of the new tasks are healthy, it will take a minute or two for the
  load balancer to mark the API service as healthy. This process can be
  accelerated by opening the AWS EC2 Load Balancers UI, viewing the API Target
  Group, and manually initiating target registration by clicking 'Register
  Targets'.
- Once the ECS tasks and LB targets are all healthy, you can also check each
  service in CloudWatch Logs to ensure it's functioning as expected. There is a
  distinct log stream for each backend service in CloudWatch.

If the tasks and load balancer targets are healthy, the backend deployment is
complete.

**To automate this step:**

- Change `deployed_version` to `latest` for all ECS services
- Add an extra instance to the ECS cluster to provide capacity for graceful
  deployments
- Configure ECS to automatically stop outdated tasks if a newer task is healthy

## Step 4: Build and Upload Web Client

This step requires S3 and CloudFront permissions in AWS.

On a Mac or Linux system, build the web client using the Staging configuration:

```bash
# From the repo root:
FIREBASE_URL=foo API_URL=bar scripts/build_staging_app.sh
```

Note: `FIREBASE_URL` must end in `.firebaseio.com/`, including the slash.
`API_URL` should not include a trailing slash.

This will build the game with all resources bundled with the app. Once it's
done, we can test it out using the desktop client:

```bash
# From the repo root:
cd desktop
yarn build:mac && yarn start:mac # Or windows or linux.
```

Log in and play a practice game. Keep an eye out for visual glitches such as
missing cardbacks. If something like this occurs, rebuilding the app by
rerunning the script will generally resolve the issue.

Once the build looks good, we need to upload it to the assets bucket in S3:

```bash
# From the repo root:
export NODE_ENV=staging
export AWS_ACCESS_KEY=foo
export AWS_SECRET_KEY=bar
export AWS_REGION=my-region
export S3_ASSETS_BUCKET=my-bucket
yarn cdn:upload:web
```

If the build includes changes to static assets and not just the code, you can
sync all resources instead:

```bash
# From the repo root:
export NODE_ENV=staging
export AWS_ACCESS_KEY=foo
export AWS_SECRET_KEY=bar
export AWS_REGION=my-region
export S3_ASSETS_BUCKET=my-bucket
yarn cdn:upload:all
```

Since the web client is heavily cached in CloudFront, we can create a cache
invalidation to get the new version out faster. To do this, open the AWS
CloudFront UI, open the CDN distribution, and click 'Invalidations'. On this
page, create a new invalidation for `/staging/duelyst.js` and click 'Create
invalidation'. This will take a few minutes, after which the updated web client
will be served to end users.

**To automate this step:**

- Add an IAM user, role, and policy via Terraform which allows uploading files
  to S3 and creating CloudFront invalidations
- Generate access keys for the IAM user, and place them in Github Secrets
- Create a new Github Action which triggers when a new release is created
- Have the Github Action build the web client and upload it to S3
- Have the Github Action create a cache invalidation in CloudFront

## Step 5: Build and Upload Desktop Clients

This step requires a Mac computer, and maintainer permissions or above in the
Github repo.

The desktop client reuses the web build, so make sure you've tested the build
locally first.

To build the clients:

```bash
# From the repo root:
cd desktop
yarn build:all && yarn zip:all
```

This will create three ZIP files in `desktop/dist/build`. On the Release page in
Github, click 'Edit', and then attach these three files to the release.

**To automate this step:**

- Create a new Github Action which triggers when a new release is created
- Have the Github Action build and zip the desktop clients
- Have the Github Action attach the clients to the release