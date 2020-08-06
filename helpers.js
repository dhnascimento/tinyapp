const bcrypt = require('bcrypt');

const generateCookieKey = () => {
  return Math.random()    //  Returns a random number between 0 and 1.
  .toString(36)           //  Base36 encoding; use of letters with digits.
  .substring(2,10);        //  Returns the part of the string between the start and end indexes, or to the end of the string. 
};

const generateRandomString = () => {
  return Math.random()    //  Returns a random number between 0 and 1.
  .toString(36)           //  Base36 encoding; use of letters with digits.
  .substring(2,8);        //  Returns the part of the string between the start and end indexes, or to the end of the string. 
};

const emailLookup = (email, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email) {
        return false
      }
    }
  }
  return true;
}; 

const authenticator = (email, password, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email && bcrypt.compareSync(password, database[user]['password'])) {
        return false
      }
    }
  }
  return true;
};

const getUserByEmail = (email, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email) {
        return database[user]['id'];
      }
    }
  }
  return true;
}; 

const urlsForUser = (id, database) => {
  let urls = {};
  for (let tiny in database) {
    if (database[tiny].userID === id) {
      urls[tiny] = database[tiny]
    }
  }
  return urls;
};

module.exports = {
  generateCookieKey,
  generateRandomString,
  emailLookup,
  authenticator,
  getUserByEmail,
  urlsForUser
};