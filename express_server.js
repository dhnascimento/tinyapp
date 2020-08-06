// Requesting dependencies
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// Helper functions
const {
  generateCookieKey,
  generateRandomString,
  emailLookup,
  authenticator,
  getUserByEmail,
  urlsForUser
} = require('./helpers');


// Salts for bcrypt
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// Registering middleware functionalities
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: [generateCookieKey(), generateCookieKey(), generateCookieKey()]
}));


// Databases

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "hermes" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "pastorAbraao" },
  ty663d: { longURL: "https://www.thecure.com", userID: "hermes" },
  d7TvTl: { longURL: "https://gasdrawls.com", userID: "pastorAbraao" }
};

const users = {
  "hermes": {
    id: "hermes",
    email: "hermes@olympus.com",
    password: bcrypt.hashSync("qwerty", salt)
  },
  "pastorAbraao": {
    id: "pastorAbraao",
    email: "pa@dubness.zap",
    password: bcrypt.hashSync("123mudar", salt)
  }
};

// POST requests

// Register new user
app.post('/register',  (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please fill out all required fields");
  } else if (!emailLookup(req.body.email, users)) {
    res.status(400).send("This email already exists in our database. Please choose another one.");
  } else {
    let newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
    };
    let user_id = newUser;
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

// Login
app.post('/login',  (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please fill out all required fields");
  } else if (authenticator(req.body.email, req.body.password, users)) {
    res.status(403).send("Password or email incorrect.");
  } else  {
    let user_id = getUserByEmail(req.body.email, users);
    // res.cookie('user_id', user_id);
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

// Logout
app.post('/logout',  (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

//  Delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send('Cannot find this tiny url to delete');
  }
});

// Tiny URL page
app.post('/urls/:id', (req, res) => {
  if (req.session.user_id) {
    const id = req.params.id;
    res.redirect(`/urls/${id}`);
  }
});

// Add newly created Tiny URL data to database
app.post('/urls', (req, res) => {
  const newTinyUrl = generateRandomString();
  urlDatabase[newTinyUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  
  res.redirect('/urls');
});


// GET requests

// Redirect from short to long URL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL] || (users[req.session.user_id]['id'] !== urlDatabase[req.params.shortURL].userID)) {
    let templateVars = {
      shortURL: req.params.shortURL,
      user: users[req.session.user_id]
    };
    res.render('urls_notiny', templateVars);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// Route to create a new tiny URL
app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

// Short URL description route
app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL] || users[req.session.user_id]['id'] !== urlDatabase[req.params.shortURL].userID) {
    let templateVars = {
      shortURL: req.params.shortURL,
      user: users[req.session.user_id]
    };
    res.render('urls_notiny', templateVars);
  } else {
    let templateVars = { shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render('urls_show', templateVars);
  }
});

// Mains page with the user's URL
app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    let urlDatabaseUser = urlsForUser(req.session.user_id, urlDatabase);
    console.log(urlDatabaseUser);
    let templateVars = {
      urls: urlDatabaseUser,
      user: users[req.session.user_id]};
    res.render('urls_index', templateVars);
  } else {
    let templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render('urls_index', templateVars);
  }
});

// Login page
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

// Register page
app.get('/register', (req, res) => {
  let templateVars = {
    user: req.session.user_id
  };
  res.render('urls_register', templateVars);
});

// Redirect to main page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// URL database as JSON
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Printing on the console the port assigned to the server
app.listen(PORT, () =>  {
  console.log(`TinyApp listening on ${PORT}!`);
});