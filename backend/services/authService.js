const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connection = require('../db');

const authenticateUser = (username, password, callback) => {
  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return callback(err);
      if (!isMatch) return callback(null, null);

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      callback(null, token);
    });
  });
};

module.exports = { authenticateUser };