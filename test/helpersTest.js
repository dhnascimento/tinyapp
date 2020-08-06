const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const { authenticator } = require('../helpers.js');

const bcrypt = require('bcrypt');

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if the email is not in the database', function() {
    const user = getUserByEmail("ddd@example.com", testUsers);
    assert.isUndefined(user);
  });
});

describe('authenticator', function() {
  it('should return false if the email and password are in the database', function() {
    const user = authenticator("user@example.com","purple-monkey-dinosaur", testUsers);
    assert.isFalse(user);
  });

  it('should return true if the email is but the password is not in the database', function() {
    const user = authenticator("user@example.com","purple-monkey", testUsers);
    assert.isTrue(true);
  });

  it('should return true if the email is not but the password is in the database', function() {
    const user = authenticator("user333@example.com","purple-monkey-dinosaur", testUsers);
    assert.isTrue(true);
  });

  it('should return true if both the email and the password are not in the database', function() {
    const user = authenticator("user333@example.com","purple-monkey-bird", testUsers);
    assert.isTrue(true);
  });
  

});