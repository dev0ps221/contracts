const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

var bodyParser = require('body-parser')
const app = express();
const server = createServer(app);
const io = new Server(server);
app.x_app_path = __dirname 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

// parse application/json
app.use(bodyParser.json())


// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())


app.use(express.static(app.x_app_path+'/render/public'))
module.exports = {server,io,app}