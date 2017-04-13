const vision = require('vision');
const data = require('../database/getdata.js');

module.exports = {
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
};
