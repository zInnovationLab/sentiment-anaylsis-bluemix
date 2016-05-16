[//]: # ===================================================================
[//]: #  Licensed Materials - Property of IBM
[//]: #  "Restricted Materials of IBM"
[//]: # 
[//]: #  (c) Copyright IBM Corp. 2000, 2016 All Rights Reserved
[//]: # 
[//]: #  US Government Users Restricted Rights - Use, duplication or
[//]: # disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
[//]: # 
[//]: # This file is part of product 5655-W32.
[//]: # ===================================================================
# Tweets Sentiment Frontend

## Getting Started

### Quick start the Docker container

	Change directory to news_frontend, issue 'docker build -t <repoName> .'
	docker run -idt -p 8080:8080 <repoName>

The news sentiment view is available with http://localhost:8080/tweets-sentiment

### Quick start local instance

Issue the following commands

    npm install -g bower
    npm install
    bower install
    node app.js
    
The tweets sentiment view is available with http://localhost:8080/tweets-sentiment

## Code structure
### Custom Polymer Elements
* **elements/basic-clock** is a basic Polymer element on which tweets-sentiment depends
* **elements/basic-input-box** is a basic Polymer element on which tweets-sentiment depends
* **elements/basic-table-block** is a basic Polymer element on which tweets-sentiment depends
* **elements/tweets-sentiment** is the tweets-sentiment Polymer element which could be imported into html

### Frontend view
* **views/tweets-sentiment.ejs** is tweets sentiment frontend view