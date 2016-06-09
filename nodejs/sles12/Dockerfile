# Base image
FROM sles12:latest

# The author
MAINTAINER LoZ Open Source Ecosystem (https://www.ibm.com/developerworks/community/groups/community/lozopensource)

# Install the build dependencies
RUN zypper install -y \
        gcc-c++ \
        git \
        java-1_7_0-openjdk \
        make

# Clone the source code of Node.js from github
# Build and install Node.js
RUN git clone https://github.com/andrewlow/node.git && \
    cd node/ && \
    ./configure && \
    make && \
    make install

# Install grunt-cli
CMD ["npm", "install", "-g", "grunt-cli"]
