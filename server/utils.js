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

  if(min > max) {
    throw new Error('The maximum possible number must be larger than the minimum');
  }

  return  Math.floor((Math.random() * (max+1 - min)) + min);
}


/**
 * Generates an array of distinct random numbers within a range.
 * @param  {Int} min    Maximum number the function will generate (inclusive)
 * @param  {Int} max    Maximum number the function will generate (inclusive)
 * @param  {Int} number The number of random numbers to generate
 * @return {Array}      Array of random numbers in random order
 */
function randomIntsBetween(min, max, number=1) {

  if(min > max) {
    throw new Error('The maximum possible number must be larger than the minimum');
  }

  // Protect against infinite loops by ensuring there are enough integers in the
  // range to satisfy the requested number of random numbers
  if (max-min+1 < number) {
    throw new Error(`You cannot generate ${number} unique, random integers between ${min} and ${max}`);
  }

  let randomNumbersArray = [];
  let i = 0;

  while (i < number) {

    let rand = randomIntBetween(min, max);

    // If the number is already in the array, try again.
    if (randomNumbersArray.indexOf(rand) !== -1) {
      continue;
    }

    // Add to array and increment the counter on success
    randomNumbersArray.push(rand);
    i++;

  }

  // Return the array of ints in the random order they were generated.
  return randomNumbersArray;

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
    const wsUrl = wsProtocol + "://" + process.env.REACT_APP_WEBSOCKET_SERVER_URL;

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
  randomIntsBetween,
  sendMessageToWebsocketsServer
}
