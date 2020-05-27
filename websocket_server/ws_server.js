require('dotenv').config({ path: '../.env' });

const utils = require('./utils.js');

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: process.env.REACT_APP_WEBSOCKET_SERVER_PORT });

server.on('connection', (ws, req) => {

  // Set the handler for all incoming messages from the client user
  ws.on('message', message => {

    message = JSON.parse(message);

    switch(message.clientType) {
      case 'PLAYER':
        utils.playerMessageHandler(message, server, ws);
        break;

      case 'API_SERVER':
        utils.apiServerMessageHandler(message, server);
        break;
    }

  });

});
