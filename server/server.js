require('dotenv').config({ path: '../.env' });

// Set up Express
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
const port = (process.env.NODE_ENV === 'production' ? 443 : 3001);

const apiErrors = require('./api/errors.js');


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
    if (corsOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}


// Allow parsing of json request bodies
app.use(bodyParser.json());

// Enable GZIP compression
app.use(compression());


// API ROUTES - These routes resolve any requests starting /api
// Uses CORS settings
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
              apiErrors.badRequest(res);
              return;
          }

          break;

        default:
          apiErrors.notFound(res);
          return;

    }

    // Generically resolve the request
    const api = new Handler(req, res, db);
    api.resolve();

  }
);

// API 404 - errors as JSON
app.get("/api/?*?", (req, res) => apiErrors.notFound(res));


// MAIN APP ROUTES - Treat these routes as valid routes for a user to hit
// directly. These will resolve to the index.html file and React Router will set
// the correct app state.
const appUrls = [
  '/game/:gameId?',
  '/about',
  '/how-to-play'
];

app.get(appUrls, (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../build') });
});

// Use the build folder statically for files in the filesystem
app.use(express.static('../build'));

// All other routes provide an html 404
app.get("*", (req, res) => {
  res.sendFile('404.html', { root: path.join(__dirname, '../build') });
});

// Try to set up as Https with LetsEncrypt
let credentials;
try {
  const domain = process.env.REACT_APP_DOMAIN;
  const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8');
  const certificate = fs.readFileSync(`/etc/letsencrypt/live/${domain}/cert.pem`, 'utf8');
  const ca = fs.readFileSync(`/etc/letsencrypt/live/${domain}/chain.pem`, 'utf8');

  credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
} catch (err) {
  if (port === 443) throw new Error(err);
}

// Set up a secure/insecure server
const server = (port === 443 ? https.createServer(credentials, app) :
                               http.createServer(app));

// Start listening
server.listen(port, () => {
  console.log(`HTTP Server listening on port ${port}`);
});
