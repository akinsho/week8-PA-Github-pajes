const postData = require('../database/postdata.js');

module.exports = {
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
};
