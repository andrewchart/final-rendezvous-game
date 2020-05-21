const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/**
 * This helper class provides an initial connection to a MongoDB Instance and
 * database/collection. It additionally then provides helper methods for
 * interfacing with the database.
 */
class Database {

  /**
   * Create a new database connection via the async connect() method.
   * @param {String} url        Url of the MongoDB Instance.
   * @param {Object} opts       MongoDB Init Options.
   * @param {String} name       Name of the database to connect to.
   */
  constructor(url, opts, name) {
    this.client = null;
    this.db = null;

    this.connect(url, opts, name);
  }

  async connect(url, opts, name) {

    // Set up a client
    this.client = new MongoClient(url, opts);

    // Establish a database and collection on the class
    try {
      await this.client.connect();
      this.db = await this.client.db(name);
    } catch (error) {
      console.log(error.stack);
    }

  }

  /**
   * Closes the client connection to MongoDB
   */
  disconnect() {
    console.log(4,'cli closed');
    return this.client.close();
  }


  /**
   * Insert a single document into a collection
   * @param  {Object} document   JSON formatted object of data to insert.
   * @param  {String} collection The collection in which to insert the document.
   * @return {Promise}           Resolves to the ID of the inserted entry or null
   *                             on failure.
   */
  async insertOne(document, collection) {

    try {
      const command = await this.db.collection(collection).insertOne(document);
      assert.equal(1, command.insertedCount);
      return command.insertedId;
    } catch(error) {
      console.log(error.stack);
      return null;
    }

  }


  /**
   * Finds the first result matching the query within a collection.
   * @param  {Object}  query      Query to match the individual document to be found.
   * @param  {String}  collection The collection in which to search for the document.
   * @param  {Object}  projection A document describing the fields to return e.g.
   *                              { fieldName: 1 }.
   * @return {Promise}            Resolves to an object representation of the
   *                              result or null if no result is found or on failure.
   */
  async findOne(query, collection, projection = null) {
    try {
      return await this.db.collection(collection).findOne(query, {
        projection: projection
      });
    } catch(error) {
      console.log(error.stack);
      return null;
    }
  }


  /**
   * Appends data onto an array within a single document.
   * @param  {String}  collection The database collection to target
   * @param  {Object}  query      Query to match the individual document to be modified
   *                              e.g. { _id: "ABCD"}
   * @param  {String}  array      String which targets the correct array in the
   *                              document using dot notation e.g. `property` or
   *                              `property.subproperty`.
   * @param  {(Mixed)} data       The data to append to the array. Can be of any form
   * @return {Promise}            Resolves to true on success or false on failure
   */
  async pushOne(collection, query, array, data) {
    try {
      const command = await this.db.collection(collection).updateOne(query, {
        $push: {[array]: data}
      });
      if(command.modifiedCount === 1) return true;
      return false;
    } catch(error) {
      console.log(error.stack);
      return false;
    }
  }


}

module.exports = Database;
