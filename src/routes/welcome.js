require('env2')('./config.env');
const request = require('request');
const postData = require('../database/postdata.js');
const querystring = require('querystring');
const data = require('../database/getdata.js');


module.exports = {
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
        data.getBlogPosts((dbErr, res) => {
          if (dbErr) {
            reply.view({ message:'Lo sentimos, actualmente estamos experimentando dificultades con el servidor' });
            return;
          }
          req.cookieAuth.set({ avatarUrl:userData.avatar, username: userData.username, accessToken: userData.accessToken });
          reply.redirect('/');
        });
      });
      });
    });
  }
};
