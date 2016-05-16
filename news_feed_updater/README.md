# News Feed Updater for Sentiment Analysis 

## Overview
The News Feed Updater (NFU) is written in Node.js, a Javascript server side runtime. The NFU listens to a news channel (can be configured to other feed), then to insert the news feed into a MongoDB server, for sentiment analysis use later. . Node.js runtime Installation instructions can be found at https://developer.ibm.com/node/sdk/.

## MongoDB Database
For MongoDB installation, please refer to https://github.com/linux-on-ibm-z/docs/wiki/Building-MongoDB

* Database Setup
  * Once the installation is finished, create a database named "news", then a new collection named "news"

## News Feed Updater
* To run the updater
  * `$ node app.js`

* To kill the updater
  * issue command line `ctrl + c` to kill the process

* Configuration
  * News Feed Channel: at `line 10`, `var req = request('http://www.cbc.ca/cmlink/rss-world')`, you may change the URL to any of the new feed provider. A list of URLs from CBC and Reuters can be found: http://www.cbc.ca/rss/ and http://www.reuters.com/tools/rss
  * Database Host: at `line 17`, `var url = 'mongodb://localhost:27017/news';`, you may change `localhost` to other MongoDB host you have, as well as the port number and database name. Details to configure with Node.js MongoDB driver, please refer to https://docs.mongodb.org/getting-started/node/insert

