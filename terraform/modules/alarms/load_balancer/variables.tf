variable "load_balancer_id" {
  type        = string
  description = "The load balancer to monitor."
}

variable "target_group_ids" {
  type        = list(string)
  description = "The target groups to monitor."
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
