// These boilerplate utilities are imported into the Websockets server main
// runtime and are used to facilitate communications between the websockets server
// and player clients / API clients.


/**
 * Defines logic for handling messages coming from the API server. Bind a
 * WebSocket instance from the server's event handler function.
 * @param {WebSocket} this     WebSocket bound to this function.
 * @param {String}    message  Serialized JSON object with a generic message for
 *                             the Websockets server.
 */
function apiServerMessageHandler(message) {
  console.log("asmh", message)
}


/**
 * Get's all the connected websocket clients that are subscribed to
 * @param  {Websocket.Server} this           Bind the websocket server so the calling
 *                                           code does not have to explicity supply
 *                                           the clients set every time.
 * @param  {String}           gameId         Unique identifier for the game for
 *                                           which we want the websocket clients.
 * @param  {Array}            excludePlayers Array of integers for playerIDs within
 *                                           the game which should NOT receive the message.
 * @return {[type]}                          New set containing websocket clients.
 */
function getClientsByGameId(gameId, excludePlayers=[]) {
  //TODO this.clients <= server.clients
}


/**
 * Defines logic for handling messages from browser clients i.e. players of the
 * game. Bind a WebSocket instance from the server's event handler function.
 * @param {WebSocket} this     WebSocket bound to this function.
 * @param {String}    message  Serialized JSON object with a generic message for
 *                             the Websockets server.
 */
function playerMessageHandler(message) {

  switch(message.messageType) {
    case 'SUBSCRIBE':
    case 'UPDATE':
      this.gameId = message.gameId;
      this.playerId = message.playerId;
      return;

    default:
      return;
  }
}


/**
 * Generically sends a message to a websocket representing a player of the game
 * @param  {Array}     clients         The unique identifier for the game.
 * @param  {Object}    message         A plain object containing the message
 *                                     that the client should react to.
 * @return {Boolean}                   Returns true if the message was sent or
 *                                     false on failure.
 */
function sendMessageToPlayers(clients, message) {

  if (!clients || !message || typeof message !== "object") return false;

  // Iterate through the clients, sending the message
  try {

    clients.forEach(client => {
      return client.send(JSON.stringify(message));
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
