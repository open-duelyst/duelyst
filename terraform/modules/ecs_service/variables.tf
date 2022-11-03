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

variable "image_name" {
  type        = string
  description = "The name of the image to deploy."
}

variable "deployed_version" {
  type        = string
  description = "The version of the image to deploy."
  default     = "latest"
}

variable "container_count" {
  type        = number
  description = "The number of containers to run for this service."
  default     = 1
}

variable "container_cpu" {
  type        = number
  description = "The number of CPU units to allocate to each container."
  default     = 1024
}

variable "container_mem" {
  type        = number
  description = "The amount of memory to allocate to each container."
  default     = 350 # Allows for 2 containers on a t4g.micro instance.
}

variable "command" {
  type        = list(string)
  description = "A custom command to run in the container image."
  default     = []
}

variable "mount_points" {
  type = list(object({
    containerPath = string
    sourceVolume  = string
  }))
  description = "A list of volumes to be mounted in the container."
  default     = []
}

variable "placement_constraints" {
  type = list(object({
    type       = string
    expression = string
  }))
  description = "A list of constraints for task placement."
  default     = []
}

variable "volumes" {
  type = list(object({
    name      = string
    host_path = string
  }))
  description = "A list of volumes to attach to the task."
  default     = []
}

variable "service_port" {
  type        = number
  description = "The TCP port to expose via `portMapping` for this service. Disabled by default."
  default     = 0
}

variable "alb_target_group" {
  type        = string
  description = "The ALB target group to associate with this service. The default is no target group."
  default     = ""
}

variable "network_mode" {
  type        = string
  description = "The ECS Task networking mode to use for this service. Default is 'bridge'."
  default     = "bridge"
}

variable "subnets" {
  type        = list(string)
  description = "Subnets for the ECS service (`awsvpc` networking mode only)."
  default     = []
}

variable "security_groups" {
  type        = list(string)
  description = "Security groups for the ECS service (`awsvpc` networking mode only)."
  default     = []
}

variable "environment_variables" {
  type = list(object({
    name  = string
    value = string
  }))
  description = "A list of environment variable objects with name and value keys."
  default     = []
}

variable "secrets" {
  type = list(object({
    name      = string
    valueFrom = string
  }))
  description = "A list of secret objects with name and valueFrom (SSM path) keys."
  default     = []
}

variable "cloudmap_service_arn" {
  type        = string
  description = "An optional CloudMap service ARN to use for service discovery."
  default     = ""
}
