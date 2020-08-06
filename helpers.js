const bcrypt = require('bcrypt');

// Generate a random cookie key
const generateCookieKey = () => {
  return Math.random()    //  Returns a random number between 0 and 1.
  .toString(36)           //  Base36 encoding; use of letters with digits.
  .substring(2,10);        //  Returns the part of the string between the start and end indexes, or to the end of the string. 
};

// Generate a random string for the user ID
const generateRandomString = () => {
  return Math.random()    //  Returns a random number between 0 and 1.
  .toString(36)           //  Base36 encoding; use of letters with digits.
  .substring(2,8);        //  Returns the part of the string between the start and end indexes, or to the end of the string. 
};

// Asserts if an email is in the database
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

// Check if both email and password matches with the ones saved in the database
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

// Return user ID that matches the inputed email
const getUserByEmail = (email, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email) {
        return database[user]['id'];
      }
    }
  }
  return undefined;
}; 

// Builds an object with only the tiny urls assigned to a specific user
const urlsForUser = (id, database) => {
  let urls = {};
  for (let tiny in database) {
    if (database[tiny].userID === id) {
      urls[tiny] = database[tiny]
    }
  }
  return urls;
};

// Exports the functions
module.exports = {
  generateCookieKey,
  generateRandomString,
  emailLookup,
  authenticator,
  getUserByEmail,
  urlsForUser
};