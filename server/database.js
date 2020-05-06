const MongoClient = require('mongodb').MongoClient;

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
   * @param {String} collection Collection within the database
   */
  constructor(url, opts, name, collection) {
    this.client = null;
    this.db = null;
    this.collection = null;

    this.connect(url, opts, name, collection);
  }


  async connect(url, opts, name, collection) {

    // Set up a client 
    this.client = new MongoClient(url, opts);

    // Establish a database and collection on the class
    try {
      await this.client.connect();
      this.db = await this.client.db(name);
      this.collection = await this.db.collection(collection);
    } catch (err) {
      console.log(err.stack);
    }

  }

  /**
   * Closes the client connection to MongoDB
   */
  disconnect() {
    console.log(4,'cli closed');
    return this.client.close();
  }

  logDb() {
    console.log(2,this.db);
  }

  logCollection() {
    console.log(3,this.collection);
  }
}

module.exports = Database;
