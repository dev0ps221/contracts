const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { Router } = require('./web/routing');

var bodyParser = require('body-parser')
const app = express();
const server = createServer(app);
const io = new Server(server);
app.x_app_path = __dirname 

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())


app.use(express.static(app.x_app_path+'/render/public'))
io.on('connection', (socket) => {
  console.log('a user connected');
});
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
  const router = new Router(app)
  router.get_view('/','index.html')
  router.post('/login',(req,res)=>{
    console.info('login..')
    console.info(Object.keys(req))
    console.info(req.method)
    console.info(req.url)
    console.info(req.query)
    console.info(req.body)
    console.info(req.route)
    console.info(req._readableState)
    console.info(req.complete)
    res.send(req.body)
  })
  router.get_page('/page/:name')
});
module.exports = {server,io,app}