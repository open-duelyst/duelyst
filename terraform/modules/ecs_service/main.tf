data "aws_region" "current" {}

resource "aws_ecs_service" "service" {
  name            = var.name
  cluster         = var.cluster
  task_definition = aws_ecs_task_definition.task_def.arn
  desired_count   = var.container_count

  ordered_placement_strategy {
    type  = "binpack"
    field = "cpu"
  }

  capacity_provider_strategy {
    base              = 1
    capacity_provider = var.capacity_provider
    weight            = 100
  }

  load_balancer {
    target_group_arn = var.alb_target_group
    container_name   = var.name
    container_port   = var.service_port
  }
}

resource "aws_ecs_task_definition" "task_def" {
  family = var.name

  container_definitions = jsonencode([
    {
      name   = var.name
      image  = "public.ecr.aws/${var.ecr_registry}/${var.ecr_repository}:${var.deployed_version}"
      cpu    = var.container_cpu
      memory = var.container_mem
      portMappings = [
        {
          containerPort = var.service_port
          hostPort      = var.service_port
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-region = data.aws_region.current.name
          awslogs-group  = aws_cloudwatch_log_group.log_group.name
        }
      }
      environment = var.environment_variables
      secrets     = var.secrets
    }
  ])

  #volume {
  #  name      = "service-storage"
  #  host_path = "/ecs/service-storage"
  #}
}

resource "aws_cloudwatch_log_group" "log_group" {
  name              = var.name
  retention_in_days = 7
}
