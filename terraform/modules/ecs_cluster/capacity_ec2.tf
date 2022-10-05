# Create an ECS capacity provider.
resource "aws_ecs_capacity_provider" "capacity_provider" {
  name = var.name

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.asg.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      maximum_scaling_step_size = 1
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
    }
  }
}

# Create an autoscaling group for instances providing capacity to the ECS cluster.
resource "aws_autoscaling_group" "asg" {
  name                  = "ecs-${var.name}"
  vpc_zone_identifier   = var.subnets
  max_size              = var.max_capacity
  min_size              = var.min_capacity
  protect_from_scale_in = true

  launch_template {
    id      = aws_launch_template.template.id
    version = "$Latest"
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }

  tag {
    key                 = "Name"
    value               = "ecs-${var.name}"
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [
      # ASG capacity is managed by ECS.
      desired_capacity,
    ]
  }
}
