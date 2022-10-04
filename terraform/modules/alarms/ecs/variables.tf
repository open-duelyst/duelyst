variable "cluster_name" {
  type        = string
  description = "The ECS cluster to monitor."
}

variable "service_names" {
  type        = list(string)
  description = "The ECS services to monitor."
}

variable "cpu_threshold" {
  type        = number
  description = "Fire an alert when CPU utilization exceeds this threshold (%)."
  default     = 90
}

variable "memory_threshold" {
  type        = number
  description = "Fire an alert when memory utilization exceeds this threshold (%)."
  default     = 90
}

variable "alarm_actions" {
  type        = list(string)
  description = "Actions to take when the alarm fires."
}
