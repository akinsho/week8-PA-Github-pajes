const db_connection = require('../../database/db_connection.js');

const postData = {};

// TODO Change the last value from 4 to a variable that references username
postData.insertIntoDatabase = (reqPayload, credentials, callback) => {
  db_connection.query(`SELECT users.id FROM users WHERE users.username = '${credentials.username}'`, (err, dbResponse) => {
    if (err) {
      return callback(err);
    }
    const id = dbResponse.rows[0].id;
    const query = `INSERT INTO blogposts(title, body, username)
      VALUES ('${reqPayload.title}','${reqPayload.content}',${id})`;
    db_connection.query(query, (err, dbResponse) => {
      if (err) {
        return callback(err);
      }
      callback(null, dbResponse);
    });
  });


};

postData.checkUser = (userData, callback) => {
  db_connection.query(`SELECT users FROM users WHERE ${userData.userId} = users.github_id`, (dbErr, dbRes) => {
    if (dbErr) return callback(dbErr);
    else if(dbRes.rows.length > 0) {
      // console.log('authorise and set cookie on known user');
      return callback(null, null);
    }
    // For users not yet in our DB
    // console.log('authorise and set cookie on new user');
    db_connection.query(`INSERT INTO users(username, github_id, avatar) VALUES ( '${userData.username}', ${userData.userId}, '${userData.avatar}')`, (dbErr, dbRes) => {
      if (dbErr) return callback(dbErr);
      return callback(null, dbRes);
    });
  });
};

module.exports = postData;
