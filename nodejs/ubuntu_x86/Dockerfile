# Base image
FROM ubuntu:latest

# The author
MAINTAINER LoZ Open Source Ecosystem (https://www.ibm.com/developerworks/community/groups/community/lozopensource)

RUN apt-get update && apt-get install -y \
  nodejs \
  npm \
  && ln -s /usr/bin/nodejs /usr/bin/node

# Install grunt-cli
CMD ["npm", "install", "-g", "grunt-cli"]
