var express = require('express');
var app = express();

var Ibc1 = require('ibm-blockchain-js');
var ibc = new Ibc1();
var ccmsgs = require('./ccmsgs');

var port =  process.env.PORT || 3000;
var http = require('http');
var server = http.createServer(app).listen(port, function() {});
server.timeout = 240000;	
var ws = require('ws');
var wss = {};
console.log('Listening on port ' + port);

app.get('/', function (req, res) {
  res.send('Hello World!');
});


manual = {
    "credentials": {
        "peers": [
            {
                "discovery_host": "125d1547-cebd-4853-beed-fef03fe8fb17_vp1-discovery.blockchain.ibm.com",
                "discovery_port": 30303,
                "api_host": "125d1547-cebd-4853-beed-fef03fe8fb17_vp1-api.blockchain.ibm.com",
                "api_port_tls": 443,
                "api_port": 80,
                "type": "peer",
                "network_id": "125d1547-cebd-4853-beed-fef03fe8fb17",
                "container_id": "1bc845be39cc9729de14c73e84237967c4bf47f529ee331d75c2dd98dba03a06",
                "id": "125d1547-cebd-4853-beed-fef03fe8fb17_vp1",
                "api_url": "http://125d1547-cebd-4853-beed-fef03fe8fb17_vp1-api.blockchain.ibm.com:80"
            },
            {
                "discovery_host": "125d1547-cebd-4853-beed-fef03fe8fb17_vp2-discovery.blockchain.ibm.com",
                "discovery_port": 30303,
                "api_host": "125d1547-cebd-4853-beed-fef03fe8fb17_vp2-api.blockchain.ibm.com",
                "api_port_tls": 443,
                "api_port": 80,
                "type": "peer",
                "network_id": "125d1547-cebd-4853-beed-fef03fe8fb17",
                "container_id": "c34dc612d50a232b70f0aa3dbd009d6b62528c72b5f0f863f17d68938f018565",
                "id": "125d1547-cebd-4853-beed-fef03fe8fb17_vp2",
                "api_url": "http://125d1547-cebd-4853-beed-fef03fe8fb17_vp2-api.blockchain.ibm.com:80"
            }
        ],
        "ca": {
            "125d1547-cebd-4853-beed-fef03fe8fb17_ca": {
                "url": "125d1547-cebd-4853-beed-fef03fe8fb17_ca-api.blockchain.ibm.com:30303",
                "discovery_host": "125d1547-cebd-4853-beed-fef03fe8fb17_ca-discovery.blockchain.ibm.com",
                "discovery_port": 30303,
                "api_host": "125d1547-cebd-4853-beed-fef03fe8fb17_ca-api.blockchain.ibm.com",
                "api_port_tls": 30303,
                "api_port": 80,
                "type": "ca",
                "network_id": "125d1547-cebd-4853-beed-fef03fe8fb17",
                "container_id": "efe2408389a4ca634e64e257c0b0d22f5948b730a470aa431c79904995b0d70f"
            }
        },
        "users": [
            {
                "username": "user_type0_ff9e6f758b",
                "secret": "a5eab8d9d6",
                "enrollId": "user_type0_ff9e6f758b",
                "enrollSecret": "a5eab8d9d6"
            },
            {
                "username": "user_type0_91b4fb828d",
                "secret": "59d1b3bd34",
                "enrollId": "user_type0_91b4fb828d",
                "enrollSecret": "59d1b3bd34"
            },
            {
                "username": "user_type1_f5445da927",
                "secret": "304a47a7eb",
                "enrollId": "user_type1_f5445da927",
                "enrollSecret": "304a47a7eb"
            },
            {
                "username": "user_type1_a0e5ab072b",
                "secret": "a96aa31e5f",
                "enrollId": "user_type1_a0e5ab072b",
                "enrollSecret": "a96aa31e5f"
            },
            {
                "username": "user_type2_d629ecf9af",
                "secret": "55602e8d8e",
                "enrollId": "user_type2_d629ecf9af",
                "enrollSecret": "55602e8d8e"
            },
            {
                "username": "user_type2_006a4ebb64",
                "secret": "f06ed5caa6",
                "enrollId": "user_type2_006a4ebb64",
                "enrollSecret": "f06ed5caa6"
            },
            {
                "username": "user_type3_f26fc8d920",
                "secret": "247a2fde02",
                "enrollId": "user_type3_f26fc8d920",
                "enrollSecret": "247a2fde02"
            },
            {
                "username": "user_type3_32c8bb3ea2",
                "secret": "729ae6f9cf",
                "enrollId": "user_type3_32c8bb3ea2",
                "enrollSecret": "729ae6f9cf"
            },
            {
                "username": "user_type4_e5b23801d1",
                "secret": "69cdae6529",
                "enrollId": "user_type4_e5b23801d1",
                "enrollSecret": "69cdae6529"
            },
            {
                "username": "user_type4_a31f965be2",
                "secret": "6a10e879fd",
                "enrollId": "user_type4_a31f965be2",
                "enrollSecret": "6a10e879fd"
            }
        ]
    }
};

var peers = manual.credentials.peers;
console.log('loading hardcoded peers');
var users = null;																		//users are only found if security is on
if(manual.credentials.users) users = manual.credentials.users;
console.log('loading hardcoded users');

if(process.env.VCAP_SERVICES){															//load from vcap, search for service, 1 of the 3 should be found...
	var servicesObject = JSON.parse(process.env.VCAP_SERVICES);
	for(var i in servicesObject){
		if(i.indexOf('ibm-blockchain') >= 0){											//looks close enough
			if(servicesObject[i][0].credentials.error){
				console.log('!\n!\n! Error from Bluemix: \n', servicesObject[i][0].credentials.error, '!\n!\n');
				peers = null;
				users = null;
				process.error = {type: 'network', msg: 'Due to overwhelming demand the IBM Blockchain Network service is at maximum capacity.  Please try recreating this service at a later date.'};
			}
			if(servicesObject[i][0].credentials && servicesObject[i][0].credentials.peers){
				console.log('overwritting peers, loading from a vcap service: ', i);
				peers = servicesObject[i][0].credentials.peers;
				if(servicesObject[i][0].credentials.users){
					console.log('overwritting users, loading from a vcap service: ', i);
					users = servicesObject[i][0].credentials.users;
				} 
				else users = null;														//no security
				break;
			}
		}
	}
}

// ==================================
// configure ibm-blockchain-js sdk
// ==================================
var options = 	{
					network:{
						peers: peers,
						users: users,
						options: {quiet: true, tls:false, maxRetry: 1}
					},

					chaincode:{
						zip_url: 'https://dl.dropboxusercontent.com/u/273494/cc.zip',
						unzip_dir: '.',											//subdirectroy name of chaincode after unzipped
						git_url: 'https://github.rtp.raleigh.ibm.com/z-innovation-lab/sentiment-analysis-blumix-zSupport/blockchain',
					}
				};
if(process.env.VCAP_SERVICES){
	console.log('\n[!] looks like you are in bluemix, I am going to clear out the deploy_name so that it deploys new cc.\n[!] hope that is ok budddy\n');
	options.chaincode.deployed_name = '';
}
ibc.load(options, cb_ready);

var chaincode = null;
function cb_ready(err, cc){																	//response has chaincode functions
	if(err != null){
		console.log('! looks like an error loading the chaincode or network, app will fail\n', err);
		if(!process.error) process.error = {type: 'load', msg: err.details};				//if it already exist, keep the last error
	}
	else{
		chaincode = cc;
		ccmsgs.setup(ibc, cc);
		if(!cc.details.deployed_name || cc.details.deployed_name === ''){					//decide if i need to deploy
			cc.deploy('init', ['99'], {save_path: './cc_summaries'}, cb_deployed);
		}
		else{
			console.log('chaincode summary file indicates chaincode has been previously deployed');
			cb_deployed();
		}
	}
}

// ============================================================================================================================
// 												WebSocket Communication Madness
// ============================================================================================================================
function cb_deployed(e, d){
	if(e != null){
		console.log('! looks like a deploy error, holding off on the starting the socket\n', e);
		if(!process.error) process.error = {type: 'deploy', msg: e.details};
	}
	else{
		console.log('------------------------------------------ Websocket Up ------------------------------------------');
		ibc.save('./cc_summaries');															//save it here for chaincode investigator
		
		wss = new ws.Server({server: server});												//start the websocket now
		wss.on('connection', function connection(ws) {
			ws.on('message', function incoming(message) {
				console.log('received ws msg:', message);
				var data = JSON.parse(message);
				ccmsgs.process_msg(ws, data);
			});
			
			ws.on('close', function(){});
		});
		
		wss.broadcast = function broadcast(data) {											//send to all connections
			wss.clients.forEach(function each(client) {
				try{
					data.v = '2';
					client.send(JSON.stringify(data));
				}
				catch(e){
					console.log('error broadcast ws', e);
				}
			});
		};
		
		// ========================================================
		// Monitor the height of the blockchain
		// ========================================================
		ibc.monitor_blockheight(function(chain_stats){										//there is a new block, lets refresh everything that has a state
			if(chain_stats && chain_stats.height){
				console.log('hey new block, lets refresh and broadcast to all');
				ibc.block_stats(chain_stats.height - 1, cb_blockstats);
				wss.broadcast({msg: 'reset'});
				chaincode.query.read(['_termindex'], cb_got_index);
			}
			
			//got the block's stats, lets send the statistics
			function cb_blockstats(e, stats){
				if(chain_stats.height) stats.height = chain_stats.height - 1;
				wss.broadcast({msg: 'chainstats', e: e, chainstats: chain_stats, blockstats: stats});
			}
			
			//got the term index, lets get each term
			function cb_got_index(e, index){
				if(e != null) console.log('error:', e);
				else{
					try{
						var json = JSON.parse(index);
						for(var i in json){
							console.log('!', i, json[i]);
							chaincode.query.read([json[i]], cb_got_searchterm);
						}
					}
					catch(e){
						console.log('error:', e);
					}
				}
			}
			
			//call back for getting a searchterm, lets send a message
			function cb_got_searchterm(e, term){
				if(e != null) console.log('error:', e);
				else {
					wss.broadcast({msg: 'terms', term: term});
				}
			}
			
		});
	}
}