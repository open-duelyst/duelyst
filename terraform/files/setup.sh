echo deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main | sudo tee /etc/apt/sources.list.d/pgdg.list > /dev/null
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update -y
sudo apt-get install -y build-essential
sudo apt-get install -y git
sudo apt-get install -y redis-server
sudo apt-get install -y redis-tools
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g forever
sudo apt-get install -y postgresql-9.4
