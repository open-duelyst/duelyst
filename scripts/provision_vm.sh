#!/bin/sh

# Shell script to provision virtual machine or cloud server with nodejs and other dependecies
# Verified on Ubuntu 14.04
# needs to run as root

# Add MongoDB package to apt-get
# echo "Add MongoDB Package"
# echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" >> /etc/apt/sources.list
# apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
# echo "MongoDB Package completed"

# update system
echo "System Update"
apt-get -y update
echo "Update completed"

# apt-get utilities
apt-get -y install libssl-dev git-core pkg-config build-essential curl gcc g++ checkinstall

# from apt-get install [faster]
apt-get -y install nodejs npm

# symlink nodejs to node
ln -s /usr/bin/nodejs /usr/bin/node

# don't require sudo from npm install -g 
# npm config set prefix ~/npm
# echo "export PATH=$HOME/npm/bin:$PATH" >> ~/.bashrc

# from source install [slower]
# download and install nodejs - v. 0.10.29
# echo "Download Node.js - v. 0.10.29"
# mkdir /tmp/node-install
# cd /tmp/node-install
# wget http://nodejs.org/dist/v0.10.29/node-v0.10.29.tar.gz  # or wget http://nodejs.org/dist/node-latest.tar.gz
# tar -zxf node-v0.10.29.tar.gz
# echo "Node.js download & unpack completed"

# install node.js
# echo Install Node.js
# cd node-v0.10.29
# ./configure && make && checkinstall --install=yes --pkgname=nodejs --pkgversion "0.10.29" --default
# echo "Node.js install completed"

# Install MongoDB
# echo "Install MongoDB"
# apt-get -y install mongodb-10gen
# echo "MongoDB install completed."

# Install Redis
echo "Install Redis"
cd /tmp
mkdir redis && cd redis
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
cd src
sudo cp redis-server /usr/local/bin/
sudo cp redis-cli /usr/local/bin/
echo 'Redis install completed."'

# Install npm packages (can lock versions here)
echo "Install npm packages (global depends)"
sudo npm install -g coffeescript@1.8.0
sudo npm install -g grunt-cli 
sudo npm install -g yarn 
sudo npm install -g forever
sudo npm install -g browserify

# Install other tools 
gem install foreman

# symlink /vagrant folder to /var/www
ln -s /vagrant/ /var/www
cd /var/www
rm -rf node_modules
npm install
