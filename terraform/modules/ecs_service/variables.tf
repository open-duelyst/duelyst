variable "name" {
  type        = string
  description = "The name of this ECS service."
}

variable "cluster" {
  type        = string
  description = "The ECS cluster in which to run this service."
}

variable "container_count" {
  type        = number
  description = "The number of containers to run for this service."
  default     = 1
}

variable "container_image" {
  type        = string
  description = "The Docker or ECR image name to use for this service."
}

variable "container_cpu" {
  type        = number
  description = "The number of vCPUs to allocate to each container."
  default     = 1
}

variable "container_mem" {
  type        = number
  description = "The amount of memory to allocate to each container."
  default     = 32
}

variable "service_port" {
  type        = number
  description = "The TCP port to expose for this service."
}

variable "alb_target_group" {
  type        = string
  description = "The ALB target group to associate with this service."
}
