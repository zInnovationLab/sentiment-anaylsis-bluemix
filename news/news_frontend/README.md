
[ Licensed Materials - Property of IBM ]: #
[ "Restricted Materials of IBM" ]: #
[ (c) Copyright IBM Corp. 2000, 2016 All Rights Reserved ]: #

# News Sentiment Frontend

## Getting Started

### Quick start the Docker container

	Change directory to news_frontend, issue 'docker build -t <repoName> .'
	docker run -idt -p 8080:8080 <repoName>

The news sentiment view is available with http://localhost:8080/news-sentiment

### Quick start local instance

Issue the following commands

    npm install -g bower
    npm install
    bower install
    node app.js
    
The news sentiment view is available with http://localhost:8080/news-sentiment

## Code structure
### Custom Polymer Elements
* **elements/basic-clock** is a basic Polymer element on which news-sentiment depends
* **elements/basic-input-box** is a basic Polymer element on which news-sentiment depends
* **elements/basic-table-block** is a basic Polymer element on which news-sentiment depends
* **elements/news-sentiment** is the news-sentiment Polymer element which could be imported into html

### Frontend view
* **views/news-sentiment.ejs** is news sentiment frontend view