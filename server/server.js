const express = require('express');
const app = express();
const port = 3001;

const dbUrl = 'mongodb://localhost:27017/';
const dbOpts = { useUnifiedTopology: true };
const dbName = 'final-rendezvous-game';
const dbCollection = 'test';

// Set up a database connection
const Database = require('./database.js');
var db = new Database(dbUrl, dbOpts, dbName, dbCollection);

app.use('/api', express.static('api'))

app.get(
  '/',
  (req, res) => {

    //collection.insert({foo:'bar1'})

    db.logDb();
    db.logCollection();

    db.collection.find({}).toArray(function(err, docs) {
      if(err) throw(err)

      console.log("Found the following records")
      console.log(docs)

    });

    res.send('Yo Database!');

  }
);

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
