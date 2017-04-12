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

server.connection({
  port,
  host,
  tls: {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem')
  }
});
//  hapiJwt,
server.register([inert, credentials, vision, CookieAuth], (err) => {
  if (err) throw err;

  server.views({
    engines: { hbs: handlebars },
    path: 'views',
    layout: 'default',
    layoutPath: 'views/layout',
    partialsPath: 'views/partials'
    // helpersPath: 'views/helpers',
  });

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
        // cache = res;
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

      // const { username, password } = req.payload;
      // data.getUsers(username, password, (err, res) => {
      //   if (err) {
      //     //TODO res: cache, can be passed in but makes the above function run since
      //     //its our only means of validation
      //     reply.view('index', { message: err.message });
      //   }
      //   else if (res.length) {
      //     data.getBlogPosts((dbError, allTheBlogsPosts) => {

      //       if (dbError) {
      //         reply.view('index', { message: 'Lo sentimos, actualmente estamos experimentando dificultades con el servidor'});
      //       }
      //       req.cookieAuth.set({ username });
      //       reply({ res: allTheBlogsPosts }).redirect('/');

      //     });
      //   }
      // });
    // }

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
           postData.checkUser(userData, (dbErr, dbRes) => {
             console.log(dbErr);
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
          //  TODO Figure out how to send message with redirect
          // return reply({
          //   message: 'Ayúdame, oh Dios mío, ¿por qué?'
          // }).redirect('write-post');
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
  ttl: 3 * 60 * 10000
};

// const strategyOptions = {
//   key: process.env.SECRET,
//   validateFunc: validate,
//   verifyOptions: {
//     algorithms: [ 'HS256']'
//   }
// };

// server.auth.strategy('jwt', 'jwt', strategyOptions);
server.auth.strategy('base', 'cookie', 'optional', options);

// Start server

server.start((err) => {
  if (err) throw err;
  console.log(`Server is running on ${server.info.uri}`);
});

module.exports = server;
