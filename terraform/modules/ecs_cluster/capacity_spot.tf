locals {
  # Hourly on-demand prices.
  # Using on-demand price essentially guarantees Spot placement, and we still
  # get a 70% discount when placement succeeds.
  prices = {
    "t4g.micro" = 0.0084 # 0.0025 after 70% discount. 
    "t4g.small" = 0.0168 # 0.0050 after 70% discount. Gives 2x RAM.
  }
}

resource "aws_ecs_capacity_provider" "spot_capacity_provider" {
  name = "${var.name}-spot"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.spot_asg.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      maximum_scaling_step_size = 1
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
    }
  }
}

resource "aws_autoscaling_group" "spot_asg" {
  name                  = "ecs-${var.name}-spot"
  vpc_zone_identifier   = var.subnets
  max_size              = var.max_spot_capacity
  min_size              = var.min_spot_capacity
  protect_from_scale_in = true

  mixed_instances_policy {
    instances_distribution {
      spot_allocation_strategy = "lowest-price"
      spot_max_price           = local.prices[aws_launch_template.template.instance_type]
    }

    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.template.id
        version            = "$Latest"
      }
    }
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }

  tag {
    key                 = "Name"
    value               = "ecs-${var.name}-spot"
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [
      # ASG capacity is managed by ECS.
      desired_capacity,
    ]
  }
}
