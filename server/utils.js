/* GENERAL UTILITY FUNCTIONS */
// Utility functions used across the server side app, abstracted to a general
// `utils` module.

/**
 * Generates a random integer between two integers.
 * @param  {Int} min Maximum number the function will generate (inclusive)
 * @param  {Int} max Maximum number the function will generate (inclusive)
 * @return {Int}     A random number between min and max.
 */
function randomIntBetween(min, max) {
  return  Math.floor((Math.random() * (max+1 - min)) + min);
}


/**
 * Sends a generic piece of data to the websockets server
 * @param  {Object} message A plain object that can be serialized with JSON stringify.
 * @return {Boolean}        True on success or false on failure
 */
function sendMessageToWebsocketsServer(message) {
  try {
    const WebSocket = require('ws');
    const wsProtocol = (process.env.NODE_ENV === 'production' ? "wss" : "ws");
    const wsUrl = wsProtocol + "://" + process.env.REACT_APP_WEBSOCKET_SERVER_HTTP_SERVER_URL;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify(message));
      ws.close(); // No need to keep the connection open.
    }

  } catch (err) {
    return false;
  }

  return true;
}

module.exports = {
  randomIntBetween,
  sendMessageToWebsocketsServer
}
