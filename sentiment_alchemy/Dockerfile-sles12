# Base image
#
FROM sles12node:latest

# The author
MAINTAINER LoZ Open Source Ecosystem (https://www.ibm.com/developerworks/community/groups/community/lozopensource)

#Copy the relevant files.
RUN mkdir /sentiment-alchemy
COPY . /sentiment-alchemy
WORKDIR /sentiment-alchemy
RUN npm install

#Expose port 8080 for app.js
EXPOSE 8080

CMD node /sentiment-alchemy/app.js
