/* eslint-disable object-curly-newline */
/* eslint-disable no-plusplus */
/* eslint-disable func-names */
/* eslint-disable no-undef-init */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
const bcrypt = require('bcrypt');

const getUserByEmail = function (email, database) {
  let user = undefined;
  for (let keys in database) {
    if (database[keys].email === email) {
      user = keys;
    }
  }
  return user;
};

const generateRandomString = function () {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const findUser = function (email, inputPassword, users) {
  for (let eachUser in users) {
    if (users[eachUser].email === email) {
      if (bcrypt.compareSync(inputPassword, users[eachUser].password)) {
        return eachUser;
      }
    }
  }
  return false;
};

const findEmail = function (email, users) {
  for (let eachUser in users) {
    if (users[eachUser].email === email) {
      return false;
    }
  }
  return true;
};

const urlsForUser = function (id, urlDatabase) {
  let urlDatabyuser = {};
  for (let keys in urlDatabase) {
    if (urlDatabase[keys].userID === id) {
      urlDatabyuser[keys] = urlDatabase[keys];
    }
  }
  return urlDatabyuser;
};


module.exports = { getUserByEmail, generateRandomString, findUser, findEmail, urlsForUser };
