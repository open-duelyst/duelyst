const jwt = require('jsonwebtoken');

const secret = 'qi2jqkXUmoEFvQJ1udKxZi72k03XLThMv4HZwuKQ';
const token = jwt.sign({ admin: true }, secret, { algorithm: 'HS256' });
console.log('New Token Generated!');
console.log('--------------------');
console.log(token);
console.log('--------------------');
