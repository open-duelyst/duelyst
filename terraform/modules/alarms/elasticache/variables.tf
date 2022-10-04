variable "cluster_id" {
  type        = string
  description = "The Elasticache cluster to monitor."
}

variable "node_id" {
  type        = string
  description = "The Elasticache node to monitor."
}

variable "instance_type" {
  type        = string
  description = "The instance type of cache nodes."
}

variable "cpu_threshold" {
  type        = number
  description = "Fire an alert when CPU utilization exceeds this threshold (%)."
  default     = 90
}

variable "engine_cpu_threshold" {
  type        = number
  description = "Fire an alert when engine CPU utilization exceeds this threshold (%)."
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
