# PostgreSQL Database

## Backing up the database

To back up the PostgreSQL database, follow these steps:

1. Enable SSH access on your EC2 instances via Terraform (see `networking.tf`).
2. Create a local SSH tunnel to RDS via the EC2 instance:

```
ssh -L 5433:<your-rds-endpoint>:5432 ec2-user@<your-ec2-ip>
```

3. Back up the database with `pg_dump` locally:

```
pg_dump -h localhost -p 5433 -U <your-db-user> -f duelyst.sql
```

Enter your password and the dump will begin. When complete, the data will be stored in the `duelyst.sql` file locally.
