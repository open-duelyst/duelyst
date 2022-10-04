variable "database_id" {
  type        = string
  description = "The RDS node to monitor."
}

variable "instance_type" {
  type        = string
  description = "The instance type of database nodes."
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
