variable "name" {
  type        = string
  description = "The name of this CloudMap service, e.g. 'redis'."
}

variable "namespace_id" {
  type        = string
  description = "The CloudMap namespace in which to create this service."
}

variable "namespace_name" {
  type = string
  description = "The CloudMap namespace name for this service, e.g. 'duelyst.local'."
}
