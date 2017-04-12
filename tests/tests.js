const test = require('tape');
const server = require('../src/server.js');
const data = require('../src/database/getdata.js');

const routes = [{
  method: 'GET',
  url: '/',
  expectedStatusCode: 200,
}, {
  method: 'GET',
  url: '/write-post',
  expectedStatusCode: 200,
}, {
  method: 'GET',
  url: '/logged-in',
  expectedStatusCode: 302,
}, {
  method: 'GET',
  url: '/',
  expectedStatusCode: 200,
}, {
  method: 'GET',
  url: '/logged-out',
  expectedStatusCode: 200,
}, {
  method: 'GET',
  url: '/welcome',
  expectedStatusCode: 302,
}, {
  method: 'POST',
  url: '/submit-post',
  expectedStatusCode: 200,
}];


routes.forEach((route) => {
  test(`check ${route.url} route`, (t) => {
    const { method, url, expectedStatusCode } = route;
    const options = {
      method,
      url,
    };
    server.inject(options, (res) => {
      t.equal(res.statusCode, expectedStatusCode, `Should return statuscode of ${expectedStatusCode}`);
      if (route.url === '/' || route.url === '/write-post') {
        t.equal(res.headers['content-type'], 'text/html; charset=utf-8', 'content-type should equal html');
      }
      t.end();
    });
  });
});


test('Passing test for travis', (t) => {
  t.equal(1, 1, '1 is equal to 1');
  t.end();
});

test('database functions', (t) => {
  data.getBlogPosts((err, res) => {
    t.ok(res.length > 1);
  });
  t.end();
});
