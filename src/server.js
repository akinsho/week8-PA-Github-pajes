const hapi = require('hapi');
const vision = require('vision');
const inert = require('inert');
const handlebars = require('handlebars');

const server = new hapi.Server();

const port = +process.env.PORT || 3005;
const host = process.env.HEROKU_URL || 'localhost';

server.connection({
  port,
  host,
});

server.register([inert, vision], (err) => {
  if (err) throw err;

  server.views({
    engines: { hbs: handlebars },
    path: 'views',
    layout: 'default',
    layoutPath: 'views/layout',
    partialsPath: 'views/partials',
    helpersPath: 'views/helpers',
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.view('index');
    },

  });

  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: {
      directory: {
        path: './public',
      },
    },

  });
});

server.start((err) => {
  if (err) throw err;
  console.log(`Server is running on ${server.info.uri}`);
});
