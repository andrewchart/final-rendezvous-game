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

module.exports = {
  randomIntBetween
}
