#! /bin/bash

echo "Running setup_docker script as $(whoami)"

install_docker_compose_sles ()
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

# This may be functional for other s390x Linux Distro's - not verified
install_docker_compose_rhel ()
{
	curl -L https://github.com/docker/compose/releases/download/1.7.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
	chmod +x /usr/local/bin/docker-compose
}

install_docker_ubuntu ()
{
	#start docker-compose install procedure as documented on https://docs.docker.com/engine/installation/linux/ubuntulinux/
	echo "Detected Ubuntu Operating System"
	apt-get update
	apt-get -y install docker.io
	ln -sf /usr/bin/docker.io /usr/local/bin/docker
	sed -i '$acomplete -F _docker docker' /etc/bash_completion.d/docker.io
	service docker start
}

install_docker_sles ()
{
	echo "Detected SLES Operating System"
	cd /data/docker
	wget ftp://ftp.unicamp.br/pub/linuxpatch/s390x/suse/sles12/docker/docker-1.9.1-sles12-20151127.tar.gz
	tar -xvzf docker-1.9.1-sles12-20151127.tar.gz
	cp ./docker-1.9.1-sles12-20151127/docker /usr/bin
}

#This will only work on RHEL v7.2
install_docker_rhel (){
	echo "Detected RHEL Operating System"
	cd /data/docker/
	wget ftp://ftp.unicamp.br/pub/linuxpatch/s390x/redhat/rhel7.2/docker-1.10.1-rhel7.2-20160408.tar.gz
	tar -xvzf docker-1.10.1-rhel7.2-20160408.tar.gz
	cp ./docker-1.10.1-rhel7.2-20160408/docker /usr/bin
}

# Checking if docker daemon is running
DOCKER_RUNNING=`ps aux | grep -v grep | grep 'docker daemon'`
if [ "${DOCKER_RUNNING:-null}" = null ] ; then
	echo "Docker is not running..."
	if [[ $(uname -a) =~ .*Ubuntu.* ]] ; then
		install_docker_ubuntu
	elif [ -f /etc/redhat-release  ] ; then
		install_docker_rhel
	else
		install_docker_sles
	fi
	#docker daemon -g ${DOCKER_DAEMON_DIRECTORY} --insecure-registry ${REGISTRY}:${REGISTRY_PORT} -H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock &
	docker daemon -g ${DOCKER_DAEMON_DIRECTORY}
	disown
else
	echo "Good! Docker daemon is running."
fi

# Checking if docker-compose is installed on RHEL?
if [ -f /etc/redhat-release ] ; then
	echo "Checking for docker-compose on RHEL"
	if [ ! -x /usr/bin/docker-compose ] ; then
		echo "Docker-compose is not installed, install now..."
		install_docker_compose_rhel
	else
		echo "Good! Docker-compose is installed."
	fi
#Installed on SLES?
else
	echo "Checking for docker-compose on SLES"
	if [ ! -x /usr/bin/docker-compose ] ; then
		echo "Docker-compose is not installed, install now..."
		install_docker_compose_sles
	else
		echo "Good! Docker-compose is installed."
	fi
fi
