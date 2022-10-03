#!/bin/bash

# Add this instance to the ECS cluster.
echo ECS_CLUSTER=${var.name} >> /etc/ecs/ecs.config

# Configure CloudWatch Agent for disk and memory usage metrics.
# NOTE: Disabled since this consumes 60+ MB of our already-limited memory.
#sudo yum install -y amazon-cloudwatch-agent
#echo '{
#	"agent": {
#		"metrics_collection_interval": 60,
#		"run_as_user": "root"
#	},
#	"metrics": {
#		"metrics_collected": {
#			"disk": {
#				"measurement": ["used_percent"],
#				"metrics_collection_interval": 60,
#				"resources": ["*"]
#			},
#			"mem": {
#				"measurement": ["mem_available", "mem_used", "mem_used_percent"],
#				"metrics_collection_interval": 60
#			}
#		}
#	}
#}' > sudo tee /opt/aws/amazon-cloudwatch-agent/etc/config.json
#/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a start -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
