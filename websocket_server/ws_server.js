require('dotenv').config({ path: '../.env' });

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: process.env.REACT_APP_WEBSOCKET_SERVER_PORT });

server.on('connection', ws => {

  // Send a message to the client
  ws.send('hey client');

  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })

})
