Sentiment-analysis-blumix-zSupport is a demo project to show how to enable bluemix application on z systems. Sentiment-analysis is a demo application with nodejs as front end, mongodb as data storage and alchyme as data processing engine. 

On z platforms, Jenkins is used for the application deployment. Assuming a user pushes its application source code to the git repository, the jenkins server will fetch those code and try to build into docker images. These images will be later pushed to a docker registry. Then the Jenkins slave can fetch these images from registry, build the containers locally and start the application. And this doc focuses on the Jenkins CI process.

Apart from the application, there are two script sets:

1. `jenkins_scripts`: building two jobs, one for jenkins server and one for jenkins slave.

2. `scripts`: including the following scripts:

  `share/setup_docker.sh`: For both jenkins server and slaves, install and run docker, also install docker-compose.
  
  `jenkins_server`: The jenkins server will build a base OS image, which is a sles12 image, use docker-compose to build all images and push the images to the registry.

  `jenkins_slave`: The jenkins slave will pull the images and start the containers from the images.

Note: Before building, the jenkins slave node needs to be created as a node by jenkins server and provide the server with root access. Also, both server and slave should have access to the source code repository to get the code.

CI is provided by jenkins. So any source code changes on the repository will trigger a rebuild, so the application is always up-to-date.
