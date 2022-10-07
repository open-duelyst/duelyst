# Mingrammer diagrams for the OpenDuelyst service architecture.
# Install Graphviz to generate graphs: https://graphviz.gitlab.io/download/
# On OSX, this is 'brew install graphviz'
from diagrams import Diagram
from diagrams.aws.compute import EC2, ECS
from diagrams.aws.database import Elasticache, RDS
from diagrams.aws.general import Users
from diagrams.aws.management import SSM
from diagrams.aws.network import ALB, CloudFront, ELB
from diagrams.aws.storage import S3

graph_attrs = {
    'bgcolor': 'snow2',
    'fontsize': '48',
    'labelloc': 'top',
    'pad': '0.2',  # Inches.
}

node_attrs = {
    'width': '1.2',  # Inches (1.4 is default).
    'fontsize': '15',
}

with Diagram('AWS Infrastructure', filename='infrastructure', graph_attr=graph_attrs, show=False):
    # Components (order matters!).
    users = Users('Players', **node_attrs)
    alb = ELB('Application Load\nBalancer', **node_attrs)
    cf = CloudFront('CloudFront CDN', **node_attrs)
    s3 = S3('S3 Static Assets', **node_attrs)
    ecs = ECS('ECS Cluster\n(5 Services)', **node_attrs)
    ondemand_asg = EC2('On-Demand ASG', **node_attrs)
    spot_asg = EC2('Spot ASG', **node_attrs)
    ssm = SSM('SSM Parameter\nStore (Secrets)', **node_attrs)
    rds = RDS('RDS\n(Postgres)', **node_attrs)
    redis = Elasticache('ElastiCache\n(Redis)', **node_attrs)

    # Edges.
    users >> alb >> cf >> s3
    alb >> ecs >> [ondemand_asg, spot_asg]
    ecs << ssm
    ondemand_asg >> [rds, redis]
    spot_asg >> [rds, redis]
