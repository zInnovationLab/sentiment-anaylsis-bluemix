#!/bin/bash

read -r -a IMGS <<< $(echo $(docker images | awk '{print $1}' | grep ubuntux86))
#docker tag ${IMGS[1]} "lal/${IMGS[1]}"
for img in "${IMGS[@]}"
do
	echo "$img"
	docker tag $img "${USR_NAME}/x86_$img"
	docker push "${USR_NAME}/x86_$img"
	docker rmi "${USR_NAME}/x86_$img"

	cf ic cpi "${USR_NAME}/x86_$img" "registry.ng.bluemix.net/ivandov/x86_$img:latest"
done

# VARIABLES NEEDED TO BE SET TO RUN CF IC COMMAND AS DOCKER
export DOCKER_HOST=tcp://containers-api.ng.bluemix.net:8443
export DOCKER_CERT_PATH=/home/ivandov/.ice/certs/containers-api.ng.bluemix.net/b8f3e99e-8740-4afa-bf06-c740ad05ea82
export DOCKER_TLS_VERIFY=1

docker-compose up
