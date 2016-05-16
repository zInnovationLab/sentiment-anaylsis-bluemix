## Bluemix support

cf create-service ibm-blockchain-5-prod ibm-blockchain-plan-5-prod linuxcon-blockchain
// create service credentials and paste it into manual (app.js:21)
zip cc chaincode.go
// copy cc.zip to ~/Dropbox/Public (or some other public link and update app.js:168)
node app.js  // should deploy codechain
