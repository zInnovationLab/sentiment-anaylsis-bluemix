#!/bin/bash

#read -r -a IMGS <<< $(echo $(curl http://${REGISTRY}:${REGISTRY_PORT}/v2/_catalog |python -m json.tool | grep -o '"'${USR_NAME}'/bluemix.*"' | sed 's/"//g'))

read -r -a IMGS <<< $(echo $(docker search ivandov/s390x | awk '{print $1}' | grep -v NAME))

for img in "${IMGS[@]}"
do
#	echo "$img"
	docker pull "$img"
done
