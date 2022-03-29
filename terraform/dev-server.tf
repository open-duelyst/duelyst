variable "do_token" {
    description = "Digital Ocean API token or DIGITALOCEAN_TOKEN env var"
    default = ""
}

variable "branchName" {
    description = "The current git branch"
}

provider "digitalocean" {
}

resource "digitalocean_ssh_key" "root_ssh" {
    name = "${var.branchName}"
    public_key = "${file("ssh/terraform-deploy-branch-${var.branchName}.pub")}"
}

resource "digitalocean_droplet" "server" {
    image = "ubuntu-14-04-x64"
    name = "${var.branchName}-${count.index}"
    region = "sfo1"
    size = "2gb"
    private_networking = true
    ssh_keys = ["${digitalocean_ssh_key.root_ssh.id}"]

    connection {
        user = "root"
        # key_file deprecated in v7, removed in v8, use private_key option with file interpolation
        # key_file = "ssh/terraform-deploy-branch-${var.branchName}"
        private_key = "${file("ssh/terraform-deploy-branch-${var.branchName}")}"
    }

    provisioner "file" {
        source = "${path.module}/files/setup.sh"
        destination = "/tmp/setup.sh"
    }

    provisioner "file" {
        source = "${path.module}/files/setup-postgres.sh"
        destination = "/tmp/setup-postgres.sh"
    }

    provisioner "file" {
        source = "${path.module}/files/setup-firewall.sh"
        destination = "/tmp/setup-firewall.sh"
    }

    provisioner "remote-exec" {
        inline = [
            "echo BRANCH_NAME=${var.branchName} | sudo tee --append /etc/environment > /dev/null",
            "sudo chmod +x /tmp/setup.sh",
            "sudo chmod +x /tmp/setup-postgres.sh",
            "sudo chmod +x /tmp/setup-firewall.sh"
        ]
    }

    provisioner "remote-exec" {
        inline = [
            "/tmp/setup.sh",
            "/tmp/setup-postgres.sh",
            "/tmp/setup-firewall.sh",
        ]
    }
}

resource "digitalocean_domain" "default" {
    name = "${var.branchName}-${count.index}.duelyst-test.com"
    ip_address = "${digitalocean_droplet.server.ipv4_address}"
}

output "server_address" {
    value = "${digitalocean_droplet.server.0.ipv4_address}"
}

output "fqdn" {
    value = "${digitalocean_domain.default.id}"
}
