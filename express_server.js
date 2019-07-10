const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {username: req.cookies.username};
  res.render("register", templateVars);
});

// POST POST POST POST POST POST POST POST POST POST POST

app.post("/urls", (req, res) => {
  let shortRandom = generateRandomString();
  urlDatabase[shortRandom] = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortRandom}`);
});

app.post("/urls/:shortURL/delete", (req,res) =>{
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req,res) =>{
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/update", (req,res) =>{
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls/`);
});

app.post("/login",(req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.post('/logout',(req,res)=>{
  res.clearCookie('username');
  res.redirect('/urls')
})

app.post("/register", (req, res) => {
  user[req.cookies.username] = {
    id: req.cookies.username,
    email: req.params.email,
    password: req.params.password
  }
  console.log(user[req.cookies.username])
  res.redirect("/register");
});

const generateRandomString = function() {
  let result = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

