apt-get install wrk
apt-get install git
apt-get install nodejs
ln -s /usr/bin/nodejs /usr/bin/node
apt-get install npm
npm install --global node-nightly
node-nightly
apt-get install tmux
add-apt-repository ppa:chris-lea/redis-server
apt-get update
apt-get install redis-server=3:3.2.6-3chl1~xenial1
sudo service redis-server stop
hdparm -Tt /dev/sda1
hdparm -Tt /dev/sdb1
cd /mnt
git clone https://github.com/rystsov/gryadka-etcd.git
cd gryadka-etcd
npm install
./bin/get-etcd.sh
