/*var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine


var pg = require("pg"); // require Postgres module

// Setup connection
var username = "Postgres" // sandbox username
var password = "gis" // read only privileges on our table
var host = "localhost"
var database = "linestrings" // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

// Set up your database query to display GeoJSON
var coffee_query = "SELECT ST_AsGeoJSON(loc) FROM SELECT from newFlag2";


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/data', function (req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query(coffee_query);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].row_to_json);
        res.end();
    });
});
module.exports = router;*/

(function() {
    'use strict';
    /*jshint node:true*/

    var express = require('express');
	//var router = express.Router();

	/* PostgreSQL and PostGIS module and connection setup */
	var pg = require("pg"); // require Postgres module

	// Setup connection
	var username = "postgres" // sandbox username
	var password = "gis" // read only privileges on our table
	var host = "localhost"
	var database = "linestrings" // database name
	var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

	// Set up your database query to display GeoJSON
	var coffee_query = "SELECT loc FROM public.\"newFlag1\"";


	var http = require("http"),
	    url = require("url"),
	    path = require("path"),
	    fs = require("fs"),
	    events = require("events");
	    var tweet_emitter = new events.EventEmitter();
    http.createServer(function(request, response) {
	    var uri = url.parse(request.url).pathname;
	    if(uri === "/stream") {
	     
	        var client = new pg.Client(conString);
		    client.connect();
		    var query = client.query(coffee_query);
		    query.on("row", function (row, result) {
		        result.addRow(row);
		    });
		    query.on("end", function (result) {
		    	console.log(result.rows[0].row_to_json);
		        response.write(result.rows[0].row_to_json);
		        response.end();
		    });
		         
		}else{response.write('hello');}
		 
	}).listen(3000);
	/*router.get('/', function(req, res, next) {
	  res.render('index', { title: 'Express' });
	});


	router.get('/data', function (req, res) {
	    var client = new pg.Client(conString);
	    client.connect();
	    var query = client.query(coffee_query);
	    query.on("row", function (row, result) {
	        result.addRow(row);
	    });
	    query.on("end", function (result) {
	        res.send(result.rows[0].row_to_json);
	        res.end();
	    });
	});


	var app = express();

	app.get('/', function (req, res) {
		res.send('Hello World!');
	  //res.render('index', { title: 'Express' });
	});
	app.get('/data', function (req, res) {
	  var client = new pg.Client(conString);
	    client.connect();
	  
	    var query = client.query(coffee_query);
	    query.on("row", function (row, result) {
	        result.addRow(row);
	        console.log(result);
	    });
	    query.on("end", function (result) {
	        res.send(result.rows[0].row_to_json);
	        console.log(result.rows[0].row_to_json);
	        console.log(res);
	        res.end();
	    });
	});
	app.listen(3000, function () {
	  console.log('Example app listening on port 3000!');
	});*/

})();