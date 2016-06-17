# VARIABLES NEEDED TO BE SET TO RUN CF IC COMMAND AS DOCKER
export DOCKER_HOST=tcp://containers-api.ng.bluemix.net:8443
export DOCKER_CERT_PATH=/home/ivandov/.ice/certs/containers-api.ng.bluemix.net/b8f3e99e-8740-4afa-bf06-c740ad05ea82
export DOCKER_TLS_VERIFY=1

#copy public mongo image to bluemix registry
cf ic cpi "mongo:latest" "registry.ng.bluemix.net/ivandov/mongo:latest"

docker-compose up
