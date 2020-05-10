const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/**
 * This helper class provides an initial connection to a MongoDB Instance and
 * database/collection. It additionally then provides helper methods for
 * interfacing with the database.
 */
class Database {

  /**
   * Create a new database connection via the async connect() method
   * @param {String} url        Url of the MongoDB Instance
   * @param {Object} opts       MongoDB Init Options
   * @param {String} name       Name of the database to connect to
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
   * @param  {[type]} document   [description]
   * @param  {[type]} collection [description]
   * @return {String|null}       The ID of the inserted entry or null on failure
   */
  async insertOne(document, collection) {

    try {
      const result = await this.db.collection(collection).insertOne(document);
      assert.equal(1, result.insertedCount);
      return result.insertedId;
    } catch(error) {
      console.log(error.stack);
      return null;
    }

  }

  async findOne(query, collection) {
    try {
      return await this.db.collection(collection).findOne(query);
    } catch(error) {
      console.log(error.stack);
      return null;
    }
  }

  /* DEBUG -- TODO: REMOVE */
  async deleteAll(collection) {
    this.db.collection(collection).deleteMany({});
  }


  /* DEBUG -- TODO: REMOVE */
  logDb() {
    console.log(2,this.db);
  }

  /* DEBUG -- TODO: REMOVE */
  logCollection(collection) {
    let currentCollection = this.db.collection(collection);

    currentCollection.find({}).toArray(function(err, docs) {
      if(err) throw(err)

      console.log("Found the following records")
      console.log(docs)

    });
  }
}

module.exports = Database;
