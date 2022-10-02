variable "name" {
  type        = string
  description = "The name of this RDS instance."
}

variable "postgres_version" {
  type    = string
  default = "13.7" # 14 not yet supported without manual upgrade.
}

variable "instance_type" {
  type    = string
  default = "db.t4g.micro"
}

variable "storage" {
  type    = string
  default = "20"
}

variable "database_name" {
  type    = string
  default = "duelyst"
}

variable "subnet_ids" {
  type        = list(string)
  description = "The subnets to use for this RDS instance."
}

variable "security_group_ids" {
  type        = list(string)
  description = "The security groups to use for this RDS instance."
}

variable "username" {
  type        = string
  description = "The username for this RDS instance."
}

variable "password" {
  type        = string
  description = "The password for this RDS instance."
  sensitive   = true
}
