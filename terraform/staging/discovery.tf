module "cloudmap" {
  source = "../modules/cloudmap"
  name   = "duelyst.local"
  vpc_id = module.internal_vpc.id
}
