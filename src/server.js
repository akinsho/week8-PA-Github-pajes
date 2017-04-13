const hapi = require('hapi');
const vision = require('vision');
const inert = require('inert');
const handlebars = require('handlebars');
const CookieAuth = require('hapi-auth-cookie');
const credentials = require('hapi-context-credentials');
const request = require('request');
const fs = require('fs');
const routes = require('./routes.js');

const server = new hapi.Server();

const port = process.env.PORT || 3005;
const host = 'localhost';

if (process.env.ENV === 'PROD' || process.env.ENV === 'TEST') {
  server.connection({
    port,
    host,
    tls: {
      key: fs.readFileSync('./keys/key.pem'),
      cert: fs.readFileSync('./keys/cert.pem')
    }
  });
} else {
  server.connection({
    port
  });
}

server.register([inert, credentials, vision, CookieAuth], (err) => {
  if (err) throw err;

  server.views({
    engines: { hbs: handlebars },
    path: 'views',
    layout: 'default',
    layoutPath: 'views/layout',
    partialsPath: 'views/partials'
  });


    // redirectTo: '/',
  const options = {
    password: process.env.COOKIE_SECRET,
    cookie: 'github-ap',
    isSecure: false,
    ttl: 2 * 60 * 1000,
    redirectOnTry: false,
    isSameSite: false,

  };

  server.auth.strategy('base', 'cookie', 'required', options);


  server.route(routes);

});

module.exports = server;
