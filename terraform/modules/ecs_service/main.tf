resource "aws_ecs_service" "service" {
  name            = var.name
  cluster         = var.cluster
  task_definition = aws_ecs_task_definition.task_def.arn
  desired_count   = var.container_count

  ordered_placement_strategy {
    type  = "binpack"
    field = "cpu"
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
      image  = var.container_image
      cpu    = var.container_cpu
      memory = var.container_mem
      portMappings = [
        {
          containerPort = var.service_port
          hostPort      = var.service_port
        }
      ]
    },
  ])

  #volume {
  #  name      = "service-storage"
  #  host_path = "/ecs/service-storage"
  #}
}
