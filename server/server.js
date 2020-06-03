require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

const errors = require('./errors.js');


// Set up a database connection
const dbUrl = process.env.REACT_APP_MONGO_DB_URL;
const dbOpts = { useUnifiedTopology: true };
const dbName = process.env.REACT_APP_MONGO_DB_NAME;

const Database = require('./database.js');
var db = new Database(dbUrl, dbOpts, dbName);


// Set up CORS
const corsOrigins = process.env.REACT_APP_API_CORS_ORIGINS.split(","); //Array of origins

const corsOpts = {
  origin: (origin, callback) => {
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}


// Allow parsing of json request bodies
app.use(bodyParser.json());


// API Routes (use CORS settings)
app.use(
  '/api/:entity/:entityId?/:property?/:propertyId?',
  cors(corsOpts),
  (req, res) => {

  //Determine the correct middleware to resolve the request
  var Handler;
  switch(req.params.entity) {

      case 'games':

        switch(req.params.property) {
          case 'players':
            Handler = require('./api/games/players.js');
            break;

          case undefined:
            Handler = require('./api/games/index.js');
            break;

          default:
            errors.badRequest(res);
            return;
        }

        break;

      default:
        errors.notFound(res);
        return;

  }

  // Generically resolve the request
  const api = new Handler(req, res, db);
  api.resolve();

});

//app.use(express.static('../build'))

// Main App
// app.get(
//   '/',
//   (req, res) => {
//     res.send("Hello")
//   }
// );

// All other routes 404
app.get("*", (req, res) => errors.notFound(res));

/* Start Listening */
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
