variable "load_balancer_id" {
  type        = string
  description = "The load balancer to monitor."
}

variable "http_target_group_ids" {
  type        = map(any)
  description = "The target groups for which to create 5xx alarms."
}

variable "all_target_group_ids" {
  type        = map(any)
  description = "The target groups for which to create unhealthy target alarms."
}

variable "unhealthy_target_threshold" {
  type        = number
  description = "Fire an alert when this many targets are unhealthy."
  default     = 1
}

variable "error_threshold" {
  type        = number
  description = "Fire an alert when this many errors are returned in 5 minutes."
  default     = 10
}

variable "alarm_actions" {
  type        = list(string)
  description = "Actions to take when the alarm fires."
}
