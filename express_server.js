const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {generateRandomString, findUser, findEmail, urlsForUser} = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

// GET

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user_id: req.session.user_id, userDatabase: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    console.log(`error 403 sent`);
    res.status(403).send('Error 403. Please Login First!');
  }
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

// POST

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
  const regID = findUser(req.body.email, req.body.password, users);
  if (regID === false) {
    console.log(`error 403 sent`)
    res.status(403).send('Error 403 email address or password is incorrect!');
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
  }
  if (!findEmail(req.body.email, users)) {
    console.log(`error 400 sent`);
    res.status(400).send('Error 400 email address exists!');
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

