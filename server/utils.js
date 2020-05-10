/* GENERAL UTILITY FUNCTIONS */
// Utility functions used across the server side app, abstracted to a general
// `utils` module.

/**
 * Generates a random integer between two integers.
 * @param  {Int} min Maximum number the function will generate (inclusive)
 * @param  {Int} max Maximum number the function will generate (inclusive)
 * @return {[type]}     [description]
 */
function randomIntBetween(min, max) {
  return  Math.floor((Math.random() * (max+1 - min)) + min);
}

module.exports = {
  randomIntBetween
}
