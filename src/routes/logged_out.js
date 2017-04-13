const cookieAuth = require('hapi-auth-cookie');

module.exports = {
  method: 'POST',
  path: '/logged-out',
  handler: (request, reply) => {
    request.cookieAuth.clear();
    reply.redirect('/');
  }
};
