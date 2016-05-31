#! /bin/bash

install_docker_compose ()
{
zypper install -y git libxslt-devel libxml2-devel python-setuptools libpipeline-devel python-lxml python-xml
easy_install pip
mkdir docker-compose
cd docker-compose
git clone --branch 1.5.2 https://github.com/docker/compose.git
cd compose
pip install -r requirements.txt
pip install -r requirements-dev.txt
python setup.py install
cd ../..
rm -r docker-compose
}

install_docker_ubuntu ()
{
	#start docker-compose install procedure as documented on https://docs.docker.com/engine/installation/linux/ubuntulinux/
	apt-get update
	apt-get install apt-transport-https ca-certificates
	sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
	rm -f /etc/apt/sources.list.d/docker.list
	touch /etc/apt/sources.list.d/docker.list
	echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" >> /etc/apt/sources.list.d/docker.list
	apt-get update
	apt-get purge lxc-docker
	apt-cache policy docker-engine

	#pre-requisites for Ubuntu 14.04 (IBM containers are built on this)
	apt-get install linux-image-extra-$(uname -r)
	apt-get install apparmor

	#install
	apt-get update
	apt-get install docker-engine
	service docker start
	docker run hello-world
}

# Checking if docker daemon is running
DOCKER_RUNNING=`ps aux | grep -v grep | grep 'docker daemon'`
if [ "${DOCKER_RUNNING:-null}" = null ] ; then
	echo "Docker is not running..."
	if [[ $(uname -a) =~ .*Ubuntu.* ]] ; then
		echo "Detected Ubuntu Operating System"
		install_docker_ubuntu
	elif [ ! -x /usr/bin/docker  ] ; then
		wget ftp://ftp.unicamp.br/pub/linuxpatch/s390x/suse/sles12/docker/docker-1.9.1-sles12-20151127.tar.gz
		tar -xvzf docker-1.9.1-sles12-20151127.tar.gz
		cp ./docker-1.9.1-sles12-20151127/docker /usr/bin
	fi
	#docker daemon -g ${DOCKER_DAEMON_DIRECTORY} --insecure-registry ${REGISTRY}:${REGISTRY_PORT} -H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock &
	docker daemon -g ${DOCKER_DAEMON_DIRECTORY}
	disown
else
	echo "Good! Docker daemon is running."
fi

# Checking if docker-compose is installed
if [ ! -x /usr/bin/docker-compose ] ; then
	echo "Docker-compose is not installed, install now..."
	#install_docker_compose
else
	echo "Good! Docker-compose is installed."
fi
