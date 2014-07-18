var express = require('express'),
	app  	= express(),
	bodyParser = require('body-parser'),
	jade 	= require("jade"),
	
	portraits = [];
	
	config 	= require("./config"),
	gcs 	= require("gcs-signed-urls")(config.servicesEmail, config.storageBucket, config.privateKey);

app.use(bodyParser.json());

// Lets Make certain CORS is setup so we can upload from browser
CloudStorage.cors(jade.renderFile(__dirname+'/cors.jade', {}));

// Change everything to public-read
CloudStorage.defaultAcl("public-read");

// Lets serve our www directory
app.use(express.static(__dirname + '/www'));

// Allow the user to request permission to upload an image
app.post("/upload", function(req, res, next) {
	console.log(req.body);
	res.send(CloudStorage.uploadRequest(req.body.filename, "portrait/"+Date.now()+"/"+req.body.filename));
});

app.listen(process.env.PORT || 3001);