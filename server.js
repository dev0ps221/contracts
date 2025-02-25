const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { Router } = require('./web/routing');
const app = express();
const server = createServer(app);
const io = new Server(server);
app.x_app_path = __dirname 

app.use(express.static(app.x_app_path+'/render/public'))
io.on('connection', (socket) => {
  console.log('a user connected');
});
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
  const router = new Router(app)
  router.get_view('/','index.html')
  router.get_page('/page/:name')
});
module.exports = {server,io,app}