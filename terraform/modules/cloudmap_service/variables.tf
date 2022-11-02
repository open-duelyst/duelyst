variable "name" {
  type        = string
  description = "The name of this CloudMap service, e.g. 'redis'."
}

variable "namespace_id" {
  type        = string
  description = "The CloudMap namespace in which to create this service."
}
