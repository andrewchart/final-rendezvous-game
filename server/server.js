require('dotenv').config({ path: '../.env' });

// Express and Server Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();

// Websockets: Websocket Server Dependencies
const WebSocket = require('ws');
const wsUtils = require('./websockets/utils.js');

// Express: Set up CORS
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

// Express: Allow parsing of json request bodies
app.use(bodyParser.json());

// Express: Enable GZIP compression
app.use(compression());


// API: Set up a database connection
const dbUrl = process.env.REACT_APP_MONGO_DB_URL;
const dbOpts = { useUnifiedTopology: true };
const dbName = process.env.REACT_APP_MONGO_DB_NAME;

const Database = require('./database.js');
var db = new Database(dbUrl, dbOpts, dbName);

// API: Routes
// These routes resolve any requests starting /api. Uses CORS settings.
const apiErrors = require('./api/errors.js');

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

// API: 404 Errors
// Delivers not found errors beneath /api as JSON instead of HTML
app.get("/api/?*?", (req, res) => apiErrors.notFound(res));


// App: Main App Routes
// These are routes that are considered as valid routes for a user to hit directly.
// They resolve to the index.html file and React Router will set the correct app state.
const appUrls = [
  '/game/:gameId?',
  '/about',
  '/how-to-play'
];

app.get(appUrls, (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../build') });
});

// App: Fileserver
// Use the `build` folder statically to serve files from the filesystem
app.use(express.static('../build'));

// App: 404 Errors
// All other routes provide an HTML 404 page
app.get("*", (req, res) => {
  res.status(405).sendFile('404.html', { root: path.join(__dirname, '../build') });
});


// Express & Websockets: Server Listen
// Determine port number depending on environment and start listening
const port = (process.env.NODE_ENV === 'production' ? 443 : 3001);

// Try to set up as an https server with LetsEncrypt
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

// Set up the http server object, with https if appropriate
const httpServer = (port === 443 ? https.createServer(credentials, app) :
                                   http.createServer(app));

// Also set up a websocket server on the same port, passing in the http server obj
const wsServer = new WebSocket.Server({ server: httpServer });

wsServer.on('connection', (ws, req) => {

  // Set the handler for all incoming websocket messages from the client users
  ws.on('message', message => {

    message = JSON.parse(message);

    switch(message.clientType) {
      case 'PLAYER':
        wsUtils.playerMessageHandler(message, wsServer, ws);
        break;

      case 'API_SERVER':
        console.log('api serv message');
        wsUtils.apiServerMessageHandler(message, wsServer);
        break;
    }

  });

});

// Start listening on the preferred port
httpServer.listen(port, () => {
  console.log(`http server listening on port ${port}`);
});

// If a production server with https was set up, also allow redirects from port 80 to 443
if(port === 443) {

  const plainHttpApp = express();

  plainHttpApp.get('*', function(req, res) {
    res.redirect(301, 'https://' + req.headers.host + req.url);
  });

  const plainHttpServer = http.createServer(plainHttpApp).listen(80, () => {
    console.log(`http to https redirect server listening on port 80`);
  });

}
