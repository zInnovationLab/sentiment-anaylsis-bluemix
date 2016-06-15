#!/bin/bash

read -r -a IMGS <<< $(echo $(docker images | awk '{print $1}' | grep ubuntu))
#docker tag ${IMGS[1]} "lal/${IMGS[1]}"
for img in "${IMGS[@]}"
do
	echo "$img"
	docker tag $img "${USR_NAME}/x86_$img"
	docker push "${USR_NAME}/x86_$img"
	docker rmi "${USR_NAME}/x86_$img"
done
