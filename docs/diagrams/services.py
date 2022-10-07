# Mingrammer diagrams for the OpenDuelyst service architecture.
# Install Graphviz to generate graphs: https://graphviz.gitlab.io/download/
# On OSX, this is 'brew install graphviz'
from diagrams import Cluster, Diagram, Edge
from diagrams.firebase.develop import RealtimeDatabase
from diagrams.onprem.database import Postgresql
from diagrams.onprem.inmemory import Redis
from diagrams.programming.language import Javascript, Nodejs

graph_attrs = {
    'bgcolor': 'snow2',
    'fontsize': '48',
    'labelloc': 'top',
    'pad': '0.2',  # Inches.
}

cluster_attrs = {
    'fontsize': '14',
    'labeljust': 'c',
}

node_attrs = {
    'width': '1.2',  # Inches (1.4 is default).
    'fontsize': '0',  # Hide labels.
}

with Diagram('Service Architecture', filename='services', graph_attr=graph_attrs, show=False):
    # Components (order matters!).
    with Cluster('Backbone.js\nClient App', direction='LR', graph_attr=cluster_attrs):
        app = Javascript('', **node_attrs)
    with Cluster('Firebase\nRealtime DB\n(used by every\nservice)', direction='LR', graph_attr=cluster_attrs):
        firebase = RealtimeDatabase('', **node_attrs)
    with Cluster('Backend Components', direction='TB', graph_attr={'labeljust': 'c'}):
        with Cluster('Express.js\nAPI Service', direction='LR', graph_attr=cluster_attrs):
            api = Nodejs('', **node_attrs)
        with Cluster('Socket.io\nGame Services', direction='LR', graph_attr=cluster_attrs):
            game = Nodejs('', **node_attrs)
    with Cluster('Kue\nWorker Service', direction='LR', graph_attr=cluster_attrs):
        worker = Nodejs('', **node_attrs)
    with Cluster('PostgreSQL\nDatabase', direction='LR', graph_attr=cluster_attrs):
        db = Postgresql('', **node_attrs)
    with Cluster('Redis Cache', direction='LR', graph_attr=cluster_attrs):
        cache = Redis('', **node_attrs)

    # Edges.
    app >> Edge() << firebase
    app >> [api, game]
    api >> db << worker
    [api, game] >> cache << worker
