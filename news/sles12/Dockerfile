#
# Licensed Materials - Property of IBM
# "Restricted Materials of IBM"
#
# (c) Copyright IBM Corp. 2000, 2016 All Rights Reserved
#

# Base image
FROM sles12node:latest

# The author
MAINTAINER LoZ Open Source Ecosystem (https://www.ibm.com/developerworks/community/groups/community/lozopensource)

RUN npm -g install bower

EXPOSE 8080
EXPOSE 10100

RUN mkdir /news
COPY ../news_frontend /news/news_frontend
WORKDIR /news/news_frontend
RUN npm install && bower --allow-root install

CMD node /news/news_frontend/app.js
