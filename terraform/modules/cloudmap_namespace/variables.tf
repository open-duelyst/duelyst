variable "name" {
  type        = string
  description = "The name of this CloudMap namespace, e.g. 'duelyst.local'."
}

variable "vpc_id" {
  type        = string
  description = "The VPC ID with which to associate this CloudMap namespace."
}
