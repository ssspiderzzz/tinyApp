const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers')

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

let users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "$2y$12$NoyDGo.O/BEalVZQok4dv.dhXhlVOjBx4xmhW4oK3jb2uyTFbK9nS"
  }
}

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: "Hello World" };
//   res.render("hello_world", templateVars);
// });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id), user_id: req.session.user_id, userDatabase: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.session.user_id, userDatabase: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.session.user_id, userDatabase: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {user_id: req.session.user_id, userDatabase: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {user_id: req.session.user_id, userDatabase: users[req.session.user_id]};
  res.render("login", templateVars);
});

// POST POST POST POST POST POST POST POST POST POST POST

app.post("/urls", (req, res) => {
  let shortRandom = generateRandomString();
  urlDatabase[shortRandom] = {};
  urlDatabase[shortRandom].longURL = req.body.longURL;
  urlDatabase[shortRandom].userID = req.session.user_id;
  res.redirect(`/urls/${shortRandom}`);
});

app.post("/urls/:shortURL/delete", (req,res) =>{
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req,res) =>{
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/update", (req,res) =>{
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.newLongURL;
  }
  res.redirect(`/urls`);
});

app.post("/login",(req, res) => {
  const regID = findUser(req.body.email, req.body.password);
  if (regID === false) {
    console.log(`error 403 sent`)
    res.status(403).send('Error 403 email address or password is incorrect!');
    res.redirect("/login");
  }
  req.session.user_id = regID;
  res.redirect("/urls");
})

app.post('/logout',(req,res)=>{
  req.session = null;
  res.redirect('/urls')
})

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    console.log(`error 400 sent`)
    res.status(400).send('Error 400 email address or password cannot be blank!');
    res.redirect("/register");
  }
  if (!findEmail(req.body.email)) {
    console.log(`error 400 sent`);
    res.status(400).send('Error 400 email address exists!');
    res.redirect("/register");
  }
  const regID = generateRandomString();
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[`${regID}`] = {
    id: `${regID}`,
    email: req.body.email,
    password: hashedPassword
  }
  req.session.user_id = regID;
  res.redirect("/urls");
});

const generateRandomString = function() {
  let result = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const findUser = function(email, inputPassword) {
  for (let eachUser in users) {
    if (users[eachUser].email === email) {
      if(bcrypt.compareSync(inputPassword, users[eachUser].password)) {
        return eachUser;
      }
    }
  }
  return false;
}

const findEmail = function(email) {
  for (let eachUser in users) {
    if (users[eachUser].email === email) {
        return false;
      }
  }
  return true;
}

const urlsForUser = function(id) {
  let urlDatabyuser = {};
  for (let keys in urlDatabase) {
    if (urlDatabase[keys].userID === id) {
      urlDatabyuser[keys] = urlDatabase[keys];
    } 
  }
  return urlDatabyuser;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

