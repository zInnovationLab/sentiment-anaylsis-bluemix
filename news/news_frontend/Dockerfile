#
# Licensed Materials - Property of IBM
# "Restricted Materials of IBM"
#
# (c) Copyright IBM Corp. 2000, 2016 All Rights Reserved
#
# Base image
FROM sles12node

# NOTE: This assumes your rhel7 image does not have the following already installed. If it does, you can comment the 
# following line out to save time/container images
RUN zypper install -y wget gcc gcc-c++ make git



# Copy project files
RUN mkdir -p /src/application
COPY package.json /src/application/
COPY routes/ /src/application/routes/
COPY views/ /src/application/views/
COPY public/ /src/application/public/
COPY app.js /src/application/
COPY bower.json /src/application/
COPY elements/ /src/application/elements/


# Install project dependencies 
RUN cd /src/application && npm install && npm install -g bower && bower install --allow-root && echo "Node.js build and installation successful"
 
#Expose port 8080 for app.js
EXPOSE 8080

CMD ["node", "/src/application/app.js"]
