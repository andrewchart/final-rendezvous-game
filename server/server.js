const express = require('express');
const app = express();
const port = 3001;

const errors = require('./errors.js');

const dbUrl = 'mongodb://localhost:27017/';
const dbOpts = { useUnifiedTopology: true };
const dbName = 'final-rendezvous-game';

// Set up a database connection
const Database = require('./database.js');
var db = new Database(dbUrl, dbOpts, dbName);


// API Routes
app.use('/api/:entity/:id?', (req, res)=>{

  //Determine the correct middleware to resolve the request
  var entityHandler;
  switch(req.params.entity) {
      case 'games':
        entityHandler = require('./api/games/index.js');
        break;

      default:
        errors.notFound(res);
        return;
  }

  // Generically resolve the request
  const api = new entityHandler(req, res);
  api.resolve();

});

// Main App
// app.get(
//   '/',
//   (req, res) => {
//
//   }
// );

// All other routes 404
app.get("*", (req, res) => errors.notFound(res));



/* Start Listening */
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
