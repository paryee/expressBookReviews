const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

// Function to check if the username is valid
const isValid = (username) => {
  // Check if the username is a non-empty string
  return typeof username === 'string' && username.trim().length > 0;
};

// Function to check if username and password match the records
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
};



//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added successfully" });
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
