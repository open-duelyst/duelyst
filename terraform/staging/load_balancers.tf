#module "api_load_balancer" {
#  source          = "../modules/load_balancer"
#  name            = "api-lb"
#  security_groups = []
#  subnets = [
#    module.first_subnet.id,
#    module.second_subnet.id,
#    module.third_subnet.id,
#  ]
#}
