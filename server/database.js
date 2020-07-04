const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/**
 * This helper class provides an initial connection to a MongoDB Instance and
 * database/collection. It additionally then provides helper methods for
 * interfacing with the database.
 */
class Database {

  constructor() {
    this.client = null;
    this.db = null;
  }

  /**
   * Sets up a database client and db connection on the class.
   * @param  {String}  url  MongoDB url
   * @param  {Objects} opts MongoDB client options object
   * @param  {String}  name The name of the database to connect to
   * @return {Promise}      Resolves to the connected instance of the class or
   *                        null on error.
   */
  async connect(url, opts, name) {

    // Set up a client
    this.client = new MongoClient(url, opts);

    // Establish a database and collection on the class
    try {

      return this.client.connect().then(async () => {
        this.db = await this.client.db(name);
        return this;
      });

    } catch (error) {
      console.log(error.stack);
      return null;
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
   * Gets one random entry from the specified collection. Good distribution for
   * relatively small collections but bear in mind that .skip() scans the whole set.
   * @param  {String}  collection The collection in which to search for the document.
   * @param  {Object}  projection A document describing the fields to return e.g.
   *                              { fieldName: 1 }.
   * @return {Promise}            Resolves to an object representation of the random
   *                              document or null if no result is found or on failure.
   */
  async findOneRandom(collection, projection = null) {
    try {

      // Count the documents in the collection
      let count = await this.db.collection(collection).countDocuments();

      // Generate a number of documents for the cursor to skip (0 to n-1)
      let rand = utils.randomIntBetween(0, count-1);

      // Scan the collection with an optional projection
      return await this.db.collection(collection)
        .find({}, {
          projection: projection
        })
        .limit(-1)
        .skip(rand)
        .next();

    } catch(error) {
      console.log(error.stack);
      return null;
    }
  }


  /**
   * Finds ALL results matching the query within a collection with no pagination,
   * limit or batch sizing.
   * @param  {Object}  query      Query to match the documents to be found.
   * @param  {String}  collection The collection in which to search for the documents.
   * @param  {Object}  projection A document describing the fields to return e.g.
   *                              { fieldName: 1 }.
   * @return {Promise}            Resolves to an array of objects representation
   *                              of the results or empty array if no result is
   *                              found or on failure.
   */
  async findAll(query, collection, projection = null) {
    try {
      return await this.db.collection(collection).find(query, {
        projection: projection
      }).toArray();
    } catch(error) {
      console.log(error.stack);
      return [];
    }
  }


  /**
   * Updates a single document within a collection with the specified data
   * @param  {Object}  query      Query to match the individual document to be found.
   * @param  {String}  collection The collection in which to search for the document.
   * @param  {Object}  data       A document describing the fields to modify e.g.
   *                              { fieldName: "new value" }.
   * @return {Promise}            Resolves to an object representation of the
   *                              result or null if no document is found or on failure.
   */
  async updateOne(query, collection, data = null) {
    try {
      return await this.db.collection(collection).updateOne(query, {
        $set: data
      })
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


  /**
   * Removes an item from an array within a single document
   * @param  {String}  collection The database collection to target
   * @param  {Object}  query      Query to match the individual document to be modified
   *                              e.g. { _id: "ABCD"}
   * @param  {String}  array      String which targets the correct array in the
   *                              document using dot notation e.g. `property` or
   *                              `property.subproperty`.
   * @param  {Object}  data       Object specifying the field name/s and criteria to
   *                              match to constitute removing that entry from the
   *                              array e.g. { name: "Georgia" }
   * @return {Promise}            Resolves to true on success or false on failure
   */
  async pullOne(collection, query, array, data) {
    try {
      const command = await this.db.collection(collection).updateOne(query, {
        $pull: {[array]: data}
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
