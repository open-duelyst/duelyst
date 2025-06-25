# Cloud Cost Management

Running services in cloud computing infrastructure can be expensive, but we've
done some work to minimize these costs by taking advantage of the AWS Free Tier.

## Resource Requirements

For the full notes on resource utilization, see the resource utilization
section in [ARCHITECTURE.md](../ARCHITECTURE.md#resource-utilization).

The following table summarizes our resource utilization estimations for 500
concurrent users:

| Service  | vCPU | RAM   | Network Out | Storage |
|----------|------|-------|-------------|---------|
| API      | 2.50 | 500MB | 200 KBps    | 5GB     |
| Game     | 1.00 | 300MB | 100 KBps    | 5GB     |
| SP       | 1.00 | 300MB | 100 KBps    | 5GB     |
| Worker   | 2.00 | 300MB | Unbilled    | 5GB     |
| Postgres | 1.00 | 100MB | Unbilled    | 1GB     |
| Redis    | 1.50 | 100MB | Unbilled    | 1GB     |

## AWS Service Requirements

Running a staging environment in AWS costs about $12/month, with the following
breakdown:

### Choosing a Compute Platform: AWS ECS ($0/month)

AWS offers half a dozen ways to provision compute resources, each with their
own advantages and disadvantages.

Their classic EC2 virtual machines offer the lowest costs, but provide little
automation in terms of infrastructure management.

On the other end of the spectrum, EKS (their managed Kubernetes offering) has
extensive community support and third-party integrations for automating
infrastructure, but it also has a base cost of $73/month per cluster ($146/month
if we wanted distinct clusters for staging and production).

AWS also offers a proprietary service called Elastic Container Service (ECS).
This can be used with completely automated containers (Fargate) or with EC2
instances (ECS-EC2). While the Fargate offering is ideal in terms of simplicity
and reliability, it also has a high cost. For a service with 1 vCPU, the
minimum memory amount is 2GB. In total, this costs around $29 per vCPU per
month. With Spot pricing, this is reduced to around $11 per vCPU per month, but
this adds up quickly when scaled up to 6-7 vCPU for our peak load resource
requirements.

The ECS-EC2 option, on the other hand, is priced identically to EC2, with no
added charges for the ECS cluster.

### EC2 Instance Pricing ($4/month)

With Postgres and Redis handled by RDS and ElastiCache, we have four Node.js
services left to run. In staging, they'll need about 1 vCPU and up to 500MB of
memory each, for a total of 4 vCPU and 2GB of memory. In production, we might
scale to twice that amount at 8 vCPU and 4GB of memory.

Based on these figures, an instance type with 2 vCPU and 1GB of memory would be
suitable, as we can scale between 2-4 of these to handle our traffic. AWS
offers `t3.micro` and `t4g.micro` instances in this configuration. The EC2 Free
Tier includes one `t3.micro` for 12 months, with each additional costing around
$8/mo. The `t4g.micro` instance uses ARM processors, and instead costs around
$6/mo. When running 4 instances, these end up at approximately the same total
cost. The `t` series instances are considered "burstable" instances, which can
provide full compute power for a little over two hours before being throttled.
With a low-traffic service, this is a non-issue, as running at less than full
capacity will "reset" this timer.

AWS also offers "Spot" instances, which allow you to name your own price for
under-utilized EC2 capacity. For the above instances, this generally results in
a 70% discount. The "catch" here is that AWS can reclaim the instances at any
time by sending a 2-minute warning to the instance before shutting it down.
With ECS, this warning automatically starts draining the container and
deregistering it from the load balancer while ECS spins up a replacement. This
works well with our API and Worker services, but 2 minutes is generally not
long enough to allow in-progress games to finish. However, we can use Spot
instances in staging, where losing games is not a big deal.

In summary, running two `t4g.micro` Spot instances to power a staging ECS
cluster would cost about $4 per month.

### EBS Storage Pricing ($2/mo)

In terms of storage, EC2 provides 30GB of `gp3` disk storage for free. We don't
have any real storage requirements for the apps, so we won't incur any
significant storage costs for EBS volumes.

The default AWS ECS-Optimized AMI specifies a 30GB root volume, which increases
the storage costs based on how many instances we run. AWS offers a way to pack
our own AMI based on theirs via https://github.com/aws/amazon-ecs-ami, so we
can build custom images with an 8GB root volume instead. With two running
instances, this reduces our `gp3` EBS costs from 60GB * $0.08 = $4.80/mo to
16GB * $0.08 = $1.28/mo. However, this means we also need to retain an 8GB
snapshot backing the AMI, which costs 8GB * $0.05 = $0.40/mo.

### Networking ($0/month with Free Tier)

For load balancing, AWS provides one load balancer as part of the Free Tier. We
can also attach an SSL certificate through AWS ACM, which provides free public
certificates.

Another possible source of billing is data transfer out of EC2. The first 100GB
sent from AWS to the public Internet is free, and further data transfer is
billed at $0.09 per GB per month. With constant peak traffic, this could amount
to 1TB of monthly egress at $36/mo. However, we employ S3 and CloudFront to
avoid serving static assets from EC2.

### RDS and ElastiCache ($0/mo with Free Tier)

Of the above six resources, AWS offers fully managed solutions for Postgres
(RDS) and Redis (ElastiCache). While these are generally more expensive than
running containers, the Free Tier limits are sufficient for a staging
environment:

Postgres:

- AWS RDS provides one free `db.t4g.micro` instance per AWS account.
- This instance type has 2 vCPU, 1GB of memory, and 20GB of storage.
- 20GB of backups are also included for free.
- After the Free Tier expires, this is around $12/mo

Redis:

- AWS ElastiCache provides one free `cache.t3.micro` instance per AWS account.
- This instance type has 2 vCPU and 500MB of memory.
- After the Free Tier expires, this is around $12/mo

### CDN: S3 and CloudFront ($0/month)

S3:

- S3 is billed at $0.023 per GB per month after the first year.
- Each 2,500 GET requests cost $0.01/month.
- Like EC2, the first 100GB of data transfer is free.
- Both GET requests and data transfer are reduced by CDN caching with
	CloudFront.
- In total, serving 1GB of static assets via CDN costs pennies per month.

CloudFront:

- CloudFront provides CDN functionality and caching, with support for S3
	origins.
- The first 1TB of data transfer and 10 million requests are free.
- The first 1,000 cache invalidation requests are also free (we use one per
	deployment).

### Secrets: KMS and SSM Parameter Store ($1/month)

In order to store secrets and pull them into ECS container tasks, we use AWS
SSM Parameter Store. Encrypting the secrets before storing them is done via AWS
KMS, which charges a fee of $1 per month per key.

An alternative here is AWS Secrets Manager, which charges $0.40 per secret per
month. With five secrets, this is already twice the cost of using KMS and AWS
SSM.

### Alarms: Cloudwatch ($1/month)

The first 10 Cloudwatch Alarms in an AWS account are always free. We have about
20 alarms, so we pay for 10 of these at a rate of $0.10/month ($1/mo total).
