variable "name" {
  type        = string
  description = "The name of this ECR repository."
}

variable "about_text" {
  type        = string
  description = "The about text for this ECR repository."
  default     = "https://github.com/open-duelyst/duelyst"
}

variable "architectures" {
  type        = list(string)
  description = "The CPU architectures of images in this ECR repository."
  default     = ["ARM 64"]
}

variable "description" {
  type        = string
  description = "The description of this ECR repository."
  default     = "Container images for OpenDuelyst"
}

variable "operating_systems" {
  type        = list(string)
  description = "The operating systems of images in this ECR repository."
  default     = ["Linux"]
}
