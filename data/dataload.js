/* DATALOAD SCRIPT */
// This standalone script, which can be run at build time, reloads static data
// from the `/data` folder into the Mongo Database.

require('dotenv').config({ path: '../.env' });

const MongoClient = require('mongodb').MongoClient;

const csv = require('csv-parser');
const fs = require('fs');
const stripBom = require('strip-bom-stream');

// Database connection properties
const dbUrl = process.env.REACT_APP_MONGO_DB_URL;
const dbOpts = { useUnifiedTopology: true };
const dbName = process.env.REACT_APP_MONGO_DB_NAME;

// Connect and run operations
MongoClient.connect(dbUrl, dbOpts, function(err, database) {

  if (err) throw err;

  const db = database.db(dbName);

  // Create an array of collection names to import
  let collections = ['cities', 'codewords'];

  try {

    // Delete existing tables
    collections.forEach((collection) => {
      db.collection(collection).deleteMany({});
    });

    // Import new records
    collections.forEach((collection) => {

      let docs = [];

      // Parse the csv file
      fs.createReadStream(collection + '.csv')
        .pipe(stripBom())
        .pipe(csv({
          mapValues: ({ header, index, value }) => {

            if(header === '_id') {
              return parseInt(value);
            }

            else if (header === 'lat' || header === 'lng') {
              return parseFloat(value);
            }

            else {
              return value;
            }

          }
        }))
        .on('data', (row) => {
          docs.push(row);
        })
        .on('end', () => {
          console.log(docs);
          db.collection(collection).insertMany(docs);
          console.log(collection + '.csv successfully processed');
        });

    });

  } catch (err) {
    console.log(err);
    return false;
  }

});
