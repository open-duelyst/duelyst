resource "aws_ecrpublic_repository" "repository" {
  repository_name = var.name

  catalog_data {
    about_text        = var.about_text
    architectures     = var.architectures
    description       = var.description
    operating_systems = var.operating_systems
  }
}
