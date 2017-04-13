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
const jwt = require('jsonwebtoken');
const hapiJwt = require('hapi-auth-jwt2');

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
    path: '/write-post',
    handler: {
      view: 'write-post'
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


  server.route({
    method: 'GET',
    path: '/welcome',
    handler: (req, reply) => {
      const query = req.url.query;
      const gitHubUrl = `https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${query.code}`;

        request.post(gitHubUrl, (err, res, body) => {

        const accessToken = querystring.parse(body).access_token;
        const headers = {
          'User-Agent': 'oauth_github_jwt',
          Authorization: `token ${accessToken}`
        };
        request.get({url: 'https://api.github.com/user', headers}, (err, res, body) => {
          const parsedBody = JSON.parse(body);
        const userData = {
          'username': parsedBody.login,
          'avatar': parsedBody.avatar_url,
          'userId': parsedBody.id,
          accessToken
        };
        req.cookieAuth.set({ avatarUrl:userData.avatar, username: userData.username, accessToken: userData.accessToken });
        postData.checkUser(userData, (dbErr, dbRes) => {
          console.log(dbErr);
          data.getBlogPosts((dbErr, res) => {
            if (dbErr) {
              reply.view({ message:'Lo sentimos, actualmente estamos experimentando dificultades con el servidor' });
              return;
            }
            reply.redirect('/');
            // reply.view('index', { 
            //   res
            // });
          });
        });
        });
      });
    }
  });


  server.route({
    method: 'GET',
    path: '/my-posts',
    handler: (req, reply) => {
      data.getBlogPostsByUser(req.auth.credentials.username, (dbErr, res) => {
        if (dbErr) {
          reply.view(index, { message: 'Lo sentimos, actualmente estamos experimentando dificultades con el servidor' });
          return;
        }
        console.log('res', res);
        reply.view('index', { res });
      });
    }
  });

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

// Authentication

const options = {
  password: 'datagangrulesokdatagangrulesokdatagangrulesok',
  cookie: 'pajescookie',
  isSecure: false,
  ttl: 3 * 60 * 10000,
  isSameSite: false
};


// server.auth.strategy('jwt', 'jwt', strategyOptions);

// Start server

server.start((err) => {
  if (err) throw err;
  console.log(`Server is running on ${server.info.uri}`);
});

module.exports = server;
