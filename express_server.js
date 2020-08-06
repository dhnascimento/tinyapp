const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);


app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.set('view engine', 'ejs');

const generateCookieKey = () => {
  return Math.random()    //  Returns a random number between 0 and 1.
  .toString(36)           //  Base36 encoding; use of letters with digits.
  .substring(2,10);        //  Returns the part of the string between the start and end indexes, or to the end of the string. 
};

app.use(cookieSession({
  name: 'session',
  keys: [generateCookieKey(), generateCookieKey(), generateCookieKey()]
}))

// Helper functions

const generateRandomString = () => {
  return Math.random()    //  Returns a random number between 0 and 1.
  .toString(36)           //  Base36 encoding; use of letters with digits.
  .substring(2,8);        //  Returns the part of the string between the start and end indexes, or to the end of the string. 
};

const emailLookup = (email) => {
  for (let user of Object.keys(users)) {
    for (let item in users[user]) {
      if (users[user]['email'] === email) {
        return false
      }
    }
  }
  return true;
}; 

const authenticator = (email, password) => {
  for (let user of Object.keys(users)) {
    for (let item in users[user]) {
      if (users[user]['email'] === email && bcrypt.compareSync(password, users[user]['password'])) {
        return false
      }
    }
  }
  return true;
}; 

const getUserByEmail = (email, password, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email && bcrypt.compareSync(password, database[user]['password'])) {
        return database[user]['id'];
      }
    }
  }
  return true;
}; 

const urlsForUser = (id) => {
  let urls = {};
  for (let tiny in urlDatabase) {
    if (urlDatabase[tiny].userID === id) {
      urls[tiny] = urlDatabase[tiny]
    }
  }
  return urls;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "hermes" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "pastorAbraao" },
  ty663d: { longURL: "https://www.thecure.com", userID: "hermes" },
  d7TvTl: { longURL: "https://gasdrawls.com", userID: "pastorAbraao" }
};


// User data object
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

app.post('/register',  (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please fill out all required fields");
  } else if (!emailLookup(req.body.email)) {
    res.status(400).send("This email already exists in our database. Please choose another one.");
  } else {
    let newUser = generateRandomString();
    users[newUser] = {
    id: newUser,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt)
  };
  console.log(users);
  let user_id = newUser;
  // res.cookie('user_id', user_id);
  req.session.user_id = user_id; 
  res.redirect('/urls');
  }
});

app.post('/login',  (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please fill out all required fields");
  } else if (authenticator(req.body.email, req.body.password)) {
    res.status(403).send("Password or email incorrect.")
  } else  {
    let user_id = getUserByEmail(req.body.email, req.body.password, users);
    // res.cookie('user_id', user_id);
    req.session.user_id = user_id;
    res.redirect('/urls') 
  }
});

app.post('/logout',  (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls')
  };
}); 

app.post('/urls/:id', (req, res) => {
  if(req.session.user_id){
    const id = req.params.id;
    res.redirect(`/urls/${id}`)
  };
}); 

app.post('/urls', (req, res) => {
  const newTinyUrl = generateRandomString();
  urlDatabase[newTinyUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }; 

  console.log(urlDatabase); //Lot the POST request body to the console

  let templateVars = { shortURL: newTinyUrl, longURL: urlDatabase[newTinyUrl].longURL , user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
}); 


// GET requests
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;

    if(longURL === undefined) {
      res.render('urls_notiny');
      // setTimeout(() => res.redirect(`http://localhost:${PORT}/urls/new`), 3000);
    } else {
      res.redirect(longURL);
    };
});

app.get('/urls/new', (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  if (!users[req.session.user_id]) {
    res.redirect('/login')
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
})

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    let urlDatabaseUser = urlsForUser(req.session.user_id);
    console.log(urlDatabaseUser);
    let templateVars = { urls: urlDatabaseUser, user: users[req.session.user_id]};
    res.render('urls_index', templateVars);
  } else {
    let templateVars = { urls: urlDatabase, user: users[req.session.user_id]};
    res.render('urls_index', templateVars);
  };
});

app.get('/login', (req, res) => {
  let templateVars = {user: users[req.session.user_id]}
  res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
  let templateVars = {user: req.session.user_id}
  res.render('urls_register', templateVars);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () =>  {
  console.log(`Example app listening on ${PORT}!`);
});