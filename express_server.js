const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = { 
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
  let templateVars = { urls: urlDatabase, user_id: req.cookies.user_id};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies.user_id};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies.user_id};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies.user_id};
  res.render("login", templateVars);
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
  const loginUser = findUser(req.body.email, req.body.password);
  if (loginUser === false) {
    console.log(`error 403 sent`)
    res.status(403);
    res.redirect("/login");
  }
  res.cookie("user_id", loginUser);
  res.redirect("/urls");
})

app.post('/logout',(req,res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls')
})

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    console.log(`error 400 sent`)
    res.status(400);
    res.redirect("/register");
  }
  if (!findEmail(req.body.email)) {
    console.log(`error 400 sent`)
    res.status(400);
    res.redirect("/register");
  }
  const regID = generateRandomString();
  users[`user-${regID}`] = {
    id: `user-${regID}`,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", `user-${regID}`);
  console.log(users[`user-${regID}`]);
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

const findUser = function(email, password) {
  for (let eachUser in users) {
    if (users[eachUser].email === email) {
      if(users[eachUser].password === password) {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

