variable "name" {
  type        = string
  description = "The name of this ECS service."
}

variable "cluster" {
  type        = string
  description = "The ECS cluster in which to run this service."
}

variable "capacity_provider" {
  type        = string
  description = "The cluster capacity provider for this service."
}

variable "task_role" {
  type        = string
  description = "The task execution IAM role for this service."
}

variable "ecr_registry" {
  type        = string
  description = "The ECR registry from which to source container images."
}

variable "ecr_repository" {
  type        = string
  description = "The ECR repository from which to source container images."
}

variable "deployed_version" {
  type        = string
  description = "The version of the image to pull from the ECR repository."
  default     = "latest"
}

variable "container_count" {
  type        = number
  description = "The number of containers to run for this service."
  default     = 1
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

variable "enable_lb" {
  type        = bool
  description = "Whether or not to associate this ECS service with an ALB target group."
  default     = true
}

variable "service_port" {
  type        = number
  description = "The TCP port to expose for this service."
}

variable "alb_target_group" {
  type        = string
  description = "The ALB target group to associate with this service."
}

variable "environment_variables" {
  type = list(object({
    name  = string
    value = string
  }))
  description = "A list of environment variable objects with name and value keys."
}

variable "secrets" {
  type = list(object({
    name      = string
    valueFrom = string
  }))
  description = "A list of secret objects with name and valueFrom (SSM path) keys."
}
