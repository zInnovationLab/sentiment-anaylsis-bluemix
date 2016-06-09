# Base image
#
FROM sles12node:latest

# The author
MAINTAINER LoZ Open Source Ecosystem (https://www.ibm.com/developerworks/community/groups/community/lozopensource)

# Install grunt-cli
#RUN npm install grunt-cli mysql stochasm socket.io chance merge

RUN npm -g install bower

#Copy the relevant files.
RUN mkdir /tweets
COPY tweets_frontend /tweets/tweets_frontend
WORKDIR /tweets/tweets_frontend
RUN npm install && bower --allow-root install

#Expose port 8080 for app.js
EXPOSE 8080
EXPOSE 10100

#CMD /usr/sbin/sshd -D && /bin/bash && node /usr/local/timeseries/app.js
CMD node /tweets/tweets_frontend/app.js
