

function randomIntBetween(min, max) {
  return  Math.floor((Math.random() * (max+1 - min)) + min);
}

module.exports = {
  randomIntBetween
}
