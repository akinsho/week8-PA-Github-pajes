const hapi = require('hapi');
const vision = require('vision');
const inert = require('inert');
const handlebars = require('handlebars');
const data = require('./database/getdata.js');
const CookieAuth = require('hapi-auth-cookie');
const credentials = require('hapi-context-credentials');
const postData = require('./database/postdata.js');
const querystring = require('querystring');
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


  const options = {
    password: process.env.COOKIE_SECRET,
    cookie: 'github-ap',
    isSecure: false,
    ttl: 2 * 60 * 1000,
  };

  server.auth.strategy('base', 'cookie', 'optional', options);


  // Template routes
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      data.getBlogPosts((dbErr, res) => {
        if (dbErr) {
          reply.view('Lo sentimos, actualmente estamos experimentando dificultades con el servidor');
          return;
        }
        reply.view('index', { res });
      });
    }
  });



  server.route({
    method: 'GET',
    path: '/logged-in',
    handler: (req, reply) => {
      const clientId = process.env.CLIENT_ID;
      const clientSecret = process.env.CLIENT_SECRET;
      reply.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&client_secret=${clientSecret}`);
    }
  });


  server.route(routes);


  server.route({
    method: 'POST',
    path: '/logged-out',
    handler: (request, reply) => {
      request.cookieAuth.clear();
      reply.redirect('/');
    }
  });

  server.route({
    method: 'POST',
    path: '/submit-post',
    handler: (request, reply) => {
      postData.insertIntoDatabase(request.payload, request.auth.credentials, (dbError, res) => {
        if (dbError) {
          return reply.view('write-post', {
            message: 'Ayúdame, oh Dios mío, ¿por qué?'
          });
        }
        reply(res).redirect('/');
      });
    }
  });

  // Static routes
  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: {
      directory: {
        path: './public'
      }
    }

  });
});


server.start((err) => {
  if (err) throw err;
  console.log(`Server is running on ${server.info.uri}`);
});

module.exports = server;
