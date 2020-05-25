require('dotenv').config({ path: '../.env' });

const utils = require('./utils.js');

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: process.env.REACT_APP_WEBSOCKET_SERVER_PORT });

server.on('connection', (ws, req) => {

  // Bind `ws` (client's websocket connection) or `server` to mean `this` on helper functions
  const apiServerMessageHandler = utils.apiServerMessageHandler.bind(ws);
  const playerMessageHandler = utils.playerMessageHandler.bind(ws);

  // Set the handler for all incoming messages from the client user
  ws.on('message', message => {

    message = JSON.parse(message);

    switch(message.clientType) {
      case 'PLAYER':
        playerMessageHandler(message);
        break;

      case 'API_SERVER':
        apiServerMessageHandler(message);
        break;
    }

    //TODO: Debug; remove
    server.clients.forEach(client => {
      console.log(client.gameId, client.playerId);
    });
    console.log('===================');

  });

  return utils.sendMessageToPlayers(server.clients, { what: "What" });

});
