const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

let users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "123"
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
  let templateVars = { urls: urlsForUser(req.cookies.user_id), user_id: req.cookies.user_id};
  console.log(urlsForUser(req.cookies.user_id))
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.cookies.user_id};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  console.log('test1')
  console.log(req.params.shortURL)
  console.log('test2')
  console.log(urlDatabase[req.params.shortURL].longURL)
  // let directLongURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id};
  res.render("login", templateVars);
});

// POST POST POST POST POST POST POST POST POST POST POST

app.post("/urls", (req, res) => {
  let shortRandom = generateRandomString();
  urlDatabase[shortRandom] = {};
  urlDatabase[shortRandom].longURL = req.body.longURL;
  urlDatabase[shortRandom].userID = req.cookies.user_id;
  console.log(urlDatabase);
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortRandom}`);
});

app.post("/urls/:shortURL/delete", (req,res) =>{
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req,res) =>{
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/update", (req,res) =>{
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.newLongURL;
  }
  res.redirect(`/urls`);
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
  users[`${regID}`] = {
    id: `${regID}`,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", `${regID}`);
  console.log(users[`${regID}`]);
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

const urlsForUser = function(id) {
  let urlDatabyuser = {};
  for (let keys in urlDatabase) {
    console.log(`testing keys in urlsforuser function: \n ${keys}`)
    if (urlDatabase[keys].userID === id) {
      console.log('test')
      urlDatabyuser[keys] = urlDatabase[keys];
    } 
  }
  return urlDatabyuser;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

