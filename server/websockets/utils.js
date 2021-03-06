/* WEBSOCKET UTILITY FUNCTIONS */
// Boilerplate methods - used by the Websockets server during main runtime to
// facilitate communications between the websockets server and player clients -
// are centralised here.
//
// It's been pointed out that it's unnecessary to have a handler for WebSocket
// messages coming from the API server as, in this codebase, the api and the
// WebSocket messages are handled by the same http server. However, I decided to
// continue to implement http server messaging to ws:// since this theoretically
// requires a simpler decoupling, should we wish to sit the WSS on another domain.
// https://stackoverflow.com/questions/62337812

/**
 * Defines logic for handling messages coming from the API server.
 * @param {WebSocket.Server} server   The Websockets server which contains information
 *                                    about all connected clients.
 * @param {String}           message  Serialized JSON object with a generic message for
 *                                    the Websockets server.
 */
function apiServerMessageHandler(message, server) {

  switch(message.messageType) {
    case 'UPDATE_GAME_DATA':
      return sendMessageToPlayers(
        {
          messageType: 'UPDATE_GAME_DATA',
          data: {
            all: false,
            fields: message.data.fields
          }
        },
        getClientsByGameId(message.data.gameId, server, message.data.excludePlayers)
      );

    default:
      return;
  }
}


/**
 * Defines logic for handling messages from browser clients i.e. players of the
 * game. Receives the calling websocket as a parameter so it can be modified.
 * @param {String}           message  Serialized JSON object with a generic message for
 *                                    the Websockets server.
 * @param {WebSocket.Server} server   The Websockets server which contains information
 *                                    about all connected clients.
 * @param {WebSocket}        socket   WebSocket that sent the message to this function.
 */
function playerMessageHandler(message, server, socket) {

  switch(message.messageType) {
    case 'SUBSCRIBE':
      socket.socketId = message.socketId; // Only set this on subscription
      socket.gameId = message.gameId;
      socket.playerId = message.playerId;
      return socket;

    case 'UPDATE_SUBSCRIPTION':
      socket.gameId = message.gameId;
      socket.playerId = message.playerId;
      return socket;

    default:
      return socket;
  }
}


/**
 * Gets all the connected websocket clients that are subscribed to a particular
 * game, minus those whose players we are not interested in. The excluded players
 * can be identified either by their playerId or websocket ID.
 * @param  {String}           gameId         Unique identifier for the game for
 *                                           which we want the websocket clients.
 * @param  {Websocket.Server} server         Websocket server containing information
 *                                           about all connected clients.
 * @param  {Array}            excludePlayers Array of integers or strings
 *                                           containing playerIDs within the
 *                                           game OR websocket UUIDs which
 *                                           should NOT receive the message.
 * @return {Set}                             New set containing only the relevant
 *                                           websocket clients.
 */
function getClientsByGameId(gameId, server, excludePlayers=[]) {
  //TODO remove logging
  console.log('=========START==========');
  console.log('======All Clients=======');
  server.clients.forEach(client => console.log(client.socketId, client.gameId, client.playerId));

  console.log('=====Target Clients=====');

  // Create a new set of clients
  const filtered = new Set();

  // Add clients who match the gameId but are not one of the excluded players
  server.clients.forEach(client => {
    if(
      client.gameId === gameId &&
      excludePlayers.indexOf(client.playerId) === -1 &&
      excludePlayers.indexOf(client.socketId) === -1
    ) {
      filtered.add(client);
    }
  });

  filtered.forEach(client => console.log(client.socketId, client.gameId, client.playerId));

  console.log('==========END===========');

  // Return the filtered set
  return filtered;
}


/**
 * Generically sends a message to a set of websockets representing the players
 * of a game.
 * @param  {Object}   message     A plain object containing the message that the
 *                                client should react to.
 * @param  {Set}      clients     Set of websocket objects representing every
 *                                client who is to receive the message.
 * @return {Boolean}              Returns true if the message was sent or false
 *                                on failure.
 */
function sendMessageToPlayers(message, clients) {

  // No clients, no message, or message not an object: stop
  if (!clients || !message || typeof message !== "object") return false;

  // Iterate through the clients, sending the message
  try {
    clients.forEach(client => {
      client.send(JSON.stringify(message));
    });
  } catch (err) {
    return false;
  }

  return true;
}


// Export utilities
module.exports = {
  apiServerMessageHandler,
  getClientsByGameId,
  playerMessageHandler,
  sendMessageToPlayers
}
