'use strict;'

const Bodyparser = require('body-parser'); // enables us to parse the JSON request body
const Express = require('express'); // Our server
const App = Express();  // An instance of our server
const port = process.env.PORT || 9000; // The port we'll listen on
const Router = Express.Router();
const compression = require('compression'); // Compress the response into gzip to save bandwidth
const helmet = require('helmet'); // Rate limit our API to block DDOS or brute force attacks
const RateLimit = require('express-rate-limit');  // More rate limiting middle ware
const hidePoweredBy = require('hide-powered-by');  // Obfuscate signature of REST API technology in the response
const hsts = require('hsts');  // Only use HTTPS
const nosniff = require('dont-sniff-mimetype');  // Lock down API sniffing attempts
const xssFilter = require('x-xss-protection'); // No XSS allowed here buddy

// Implement all of our security middleware
const limiter = new RateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500,
  delayMs: 10, 
});

App.use(xssFilter());
App.use(nosniff());
App.use(hsts({
  maxAge: 15552000, // 180 days in seconds
}));
App.use(hidePoweredBy());
App.use(limiter);
App.use(helmet());
App.use(Bodyparser.urlencoded({ extended: true }));
App.use(Bodyparser.json());
App.use(compression({ threshold: 0 }));

// Insert our route mapping middleware here. In a more complex app, this should be refactored into separate module(s)
Router.use((req, res, next) => {
  // We are going to allow any origin for CORS
  // and only the GET http verb
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', ['GET']);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

Router.get('/fibonacci', (req, res) => {
    if (req.body.n && Number.isInteger(req.body.n) && req.body.n >= 0 && req.body.n < 100000) {
      let fibs = [];
      let n = req.body.n;
      for (let i = 0;  i < n; i++) {
        switch (i) {
          case 0:
          case 1:
            fibs[i] = i;
            break;
          default:
            fibs[i] = fibs[i-2] + fibs[i-1];
            break;
        }
      }
      return res.status(200).json({ n: n, fibonaccis: fibs });
    } else {
      return res.status(422).json({ error: 'Input invalid. Input must be a non-negative integer less than 100,000.' });
    }
});

Router.get('/*', (req, res) => {
  return res.status(200).json({ message: 'Welcome to the Fibonacci API' });
});

App.use('/', Router);  // Tell the server to use our route mapping
App.listen(port);  // Start our REST server
console.log('Listening on port ' + port);
