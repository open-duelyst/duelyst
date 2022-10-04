variable "threshold" {
  type        = number
  description = "Fire an alert when estimated monthly charges exceed this dollar amount."
}

variable "alarm_actions" {
  type        = list(string)
  description = "Actions to take when the alarm fires."
}
