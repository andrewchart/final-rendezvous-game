const express = require('express')
const app = express()
const port = 3001


// Connect to database
var MongoClient = require('mongodb').MongoClient

var db, collection;

const dbUrl = 'mongodb://localhost:27017/'
const dbOpts = { useUnifiedTopology: true }
const dbName = 'final-rendezvous-game'
const collName = 'test'

MongoClient.connect(dbUrl, dbOpts, (err, client) => {
  if (err) throw err

  db = client.db(dbName)
  collection = db.collection(collName)
})



app.use('/api', express.static('api'))

app.get(
  '/',
  (req, res) => {

    //collection.insert({foo:'bar1'})

    collection.find({}).toArray(function(err, docs) {
      if(err) throw(err)

      console.log("Found the following records")
      console.log(docs)
    });

    res.send('Yo Database!')
  }
);

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
