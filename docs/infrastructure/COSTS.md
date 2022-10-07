# Notes on Cost Management

For notes on resource utilization, see [ARCHITECTURE.md](ARCHITECTURE.md#resource-utilization).

The following table summarizes the above resource utilization estimations for 500 CCU load:

| Service  | vCPU | RAM   | Network Out | Storage |
|----------|------|-------|-------------|---------|
| API      | 2.50 | 500MB | 200 KBps    | 5GB     |
| Game     | 1.00 | 300MB | 100 KBps    | 5GB     |
| SP       | 1.00 | 300MB | 100 KBps    | 5GB     |
| Worker   | 2.00 | 300MB | Unbilled    | 5GB     |
| Postgres | 1.00 | 100MB | Unbilled    | 1GB     |
| Redis    | 1.50 | 100MB | Unbilled    | 1GB     |

## AWS EC2 instances

- Instance types:
	- Based on the above data, 2 vCPUs and 1GB RAM would likely suffice for each service
	- `t3g.micro` instances have 2 vCPUs and 1GB RAM, and are free for 12 months
	- `t4g.micro` instances have 2 vCPUs and 1GB RAM, and are billed at $0.0084/hour on-demand ($6.13/mo)
		- The `g` in `t4g` indicates AWS Gravitron (ARM) processors, which are about 20% cheaper than x86
		- Spot Instances (pre-emptible) are further discounted by 70%, for a final rate of $0.0025/hour
			- See https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html
			- Note: At peak load, vCPU will be limited after a 2h24m burst; scaling up will prevent this
	- With 2 `t4g.micro` On-Demand instances (4 cores for 4 staging apps), we'd be billed $12.26/mo.
	- With 6 `t4g.micro` Spot instances, we'd be billed $10.95/month.
- Storage:
	- The first 30GB of EBS storage is free for 1 year
	- Amazon's `gp3` disk type in Elastic Block Store is the most economical option
	- Storage is billed at $0.08/GB-month ($3.84/month for 8GB x 6 services)
	- There are additional charges when exceeding 3,000 IOPS or 125MB/s transfer speed
		- Given our scale, it is very unlikely that we will hit these thresholds
- Data Transfer:
	- The first 100GB/month is free indefinitely, and the next 9.1TB/month is billed at $0.09/GB
	- At peak load, we'd egress 400KB/second, 1.37GB/hour, or 1002GB/month.
		- If this number seems high, it's because it assumes we have 500 players at all times, 24/7
		- In reality, we'd likely see sine-wave concurrency over each day, likely averaging half this number
	- With 400GB of billed data transfer, we'd pay $36/month.
	- Additional work can be done to reduce the amount of network egress in API, Game, and SP

## EC2 Totals

- Using 6 `t4g.micro` instances with 8GB storage and current network egress might cost around $50/month
- This number will be significantly lower (as low as $14.79/month) with less user traffic

## Other Compute Systems

- AWS ECS-EC2
	- Billed at the same rate as EC2, but allows us to provide containers instead of provisioning VMs
- AWS ECS-Fargate
	- Fargate pods are billed at $0.03238/vCPU-hour plus $0.00356/GB-hour for memory
	- Fargate Spot pods are billed at $0.012144/vCPU-hour plus $0.0013335/GB-hour for memory
	- Fargate pod sizing has additional restrictions: with 2 vCPUs, you must allocate at least 4GB of memory
	- For 6 Spot pods with 2 vCPU and 4GB of memory, this would cost $0.18/hour or $129.75/month.
		- This price does not include Data Transfer or Storage billing, so ECS-Fargate is not a good fit for the project.
- AWS EKS
	- Creating an EKS cluster generates a $0.10/hour charge, making the base price $73/mo
	- This price does not include Compute, Data Transfer, or Storage billing, so EKS is not a good fit for the project.

## Load Balancers

- AWS Application Load Balancer (ALB):
	- The Free Tier includes 750 hours of ALB uptime each month, which means one free ALB per account.
	- Also includes 15 Load Capacity Units (LCUs) per month, which is a metric approximating the following:
		- New connections
		- Active connections
		- Processed bytes
		- Rule evaluations
	- More testing is needed to understand how many LCUs we would consume, but the ALB itself should be free.
- SSL Certificates:
	- Public certificates are always free through AWS Cert Manager, and can be easily attached to an ALB.

## CDN

- AWS CloudFront:
	- The first 1TB of data transfer and 10 million requests are free.
	- There's virtually no way we'll exceed the Free Tier limits here.

## Managed Postgres

- AWS RDS:
	- One db.t4g.micro instance (2 vCPU, 1GB memory, 20GB storage, 20GB backups) is free.

## Managed Redis

- AWS Elasticache:
	- One cache.t3.micro instance (2 vCPU, 500MB memory) is free.

## S3 Bucket (Standard Tier) to store game archives, static content, etc.:

- Would need to store about 1.1GB of data (514MB dist, 619MB resources)
- First 12 months is free
- Storage costs:
	- $0.023/GB-month ($0.03/mo).
- Per-Request costs:
	- The bucket will be behind CloudFront, so this should be minimal.
- Data Transfer costs:
	- Free up to 100GB/month.

## S3 Bucket (Standard Tier) to store Terraform state:

- The first year is free (up to 5GB stored).
- Storage costs:
	- $0.023/GB-month (virtually free for ~64KB).
- Per-Request costs:
	- $0.004/1,000 GETs and $0.05/1,000 PUTs (a little over $0.01/month for 200+200/month).
- Data Transfer costs:
	- Free up to 100GB/month.
- Total costs:
	- Approximately $0.01/month.

## AWS KMS Keys

- Used to encrypt and decrypt secrets in app containers.
- Costs $1/month per key.
