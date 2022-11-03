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

  dynamic "load_balancer" {
    for_each = var.alb_target_group == "" ? [] : ["include_this_section"]
    content {
      target_group_arn = var.alb_target_group
      container_name   = var.name
      container_port   = var.service_port
    }
  }

  dynamic "network_configuration" {
    for_each = var.network_mode == "bridge" ? [] : ["include_this_section"]
    content {
      subnets         = var.subnets
      security_groups = var.security_groups
    }
  }

  dynamic "service_registries" {
    for_each = var.cloudmap_service_arn == "" ? [] : ["include_this_section"]
    content {
      registry_arn   = var.cloudmap_service_arn
      container_name = var.name
    }
  }
}

resource "aws_ecs_task_definition" "task_def" {
  family                   = var.name
  execution_role_arn       = var.task_role
  network_mode             = var.network_mode == "bridge" ? null : var.network_mode
  requires_compatibilities = []
  tags                     = {}

  dynamic "placement_constraints" {
    for_each = var.placement_constraints
    content {
      type       = placement_constraints.value.type
      expression = placement_constraints.value.expression
    }
  }

  /* Disabled: No longer using rexray/ebs.
  dynamic "volume" {
    for_each = var.volumes
    content {
      name = volume.value.name

      docker_volume_configuration {
        driver        = "rexray/ebs"
        scope         = "shared"
        autoprovision = true
      }
    }
  }
  */

  container_definitions = jsonencode([
    {
      name        = var.name
      image       = "${var.image_name}:${var.deployed_version}"
      essential   = true
      cpu         = var.container_cpu
      memory      = var.container_mem
      command     = var.command == [] ? null : var.command
      mountPoints = var.mount_points == [] ? [] : var.mount_points
      volumesFrom = []
      portMappings = var.service_port == 0 ? [] : [{
        containerPort = var.service_port
        hostPort      = var.service_port
        protocol      = "tcp"
      }]
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
}

resource "aws_cloudwatch_log_group" "log_group" {
  name              = var.name
  retention_in_days = 7
}
