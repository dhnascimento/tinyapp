const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));


const generateRandomString = () => {
  return Math.random()    //  Returns a random number between 0 and 1.
  .toString(36)           //  Base36 encoding; use of letters with digits.
  .substring(2,8);        //  Returns the part of the string between the start and end indexes, or to the end of the string. 
};

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};


// POST requests

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls')
}); 

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`)
}); 

app.post('/urls', (req, res) => {
  const newTinyUrl = generateRandomString();
  urlDatabase[newTinyUrl] = req.body.longURL;
  console.log(urlDatabase); //Lot the POST request body to the console
  // res.send('Ok'); //Respond with "OK" (will be replaced)

  let templateVars = { shortURL: newTinyUrl, longURL: urlDatabase[newTinyUrl] };
  res.render('urls_show', templateVars);
}); 


// GET requests
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];

    if(longURL === undefined) {
      res.render('urls_notiny');
      // setTimeout(() => res.redirect(`http://localhost:${PORT}/urls/new`), 3000);
    } else {
      res.redirect(longURL);
    };
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
})

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/', (req, res) => {
  res.send('Hello!');
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