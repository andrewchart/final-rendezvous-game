/* Commonly used utilities */

/**
 * Monitors changes to form fields, writing them to state using the name as the
 * key. E.g. if the form field has a name `foo`, this.state.foo will be updated.
 * @param  {SyntheticEvent} event React synthetic event.
 */
function onChange(event) {
  let name = event.target.name;
  let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  this.setState({ [name]: value });
}

/**
 * Validates whether a string value is empty
 * @param  {String} value The value to check
 * @return {Boolean}      Returns true if the value is not empty, or false if the
 *                        value is empty
 */
function validateNotEmpty(value) {
  return (value.length > 0);
}

// Export functions
module.exports = {
  onChange,
  validateNotEmpty
}
