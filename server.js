//Package
const bodyParser = require('body-parser') // parse json, so we can call node and object const request = require('request')// networking to curl outside 
const express = require('express')// wrapper we can write node js shorter const fetch = require('node-fetch'); 
var csv = require("fast-csv"); 
var sleep = require('sleep'); 
const app = express() 

//Middleware
const port = process.env.PORT || 4000 
const hostname = '0.0.0.0' 
app.use(bodyParser.urlencoded({ extended: false }))//initiate body parser to get json app.use(bodyParser.json()) 
app.use(function (req, res, next) { 
 // Website you wish to allow to connect 
 res.setHeader('Access-Control-Allow-Origin', 'http://0.0.0.0:4200'); 
 // Request methods you wish to allow 
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH,  DELETE'); 
 // Request headers you wish to allow 
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); 
 // Set to true if you need the website to include cookies in the requests sent  // to the API (e.g. in case you use sessions) 
 res.setHeader('Access-Control-Allow-Credentials', true); 
 // Pass to next layer of middleware 
 next(); 
}); 

//Import Router
ledgerRouter = require('./routes/ledgerRouter')
blockchainRouter = require('./routes/blockchainRouter')

//Router
app.use(ledgerRouter)
app.user(blockchainRouter)

//HTTP Port
app.listen(port, hostname, () => { 
console.log(`Server running at http://${hostname}:${port}/`) })

