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
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username; // Assuming username is stored in session

  // Find the book document containing the reviews
  Book.findOne({ isbn }, (err, book) => {
    if (err) {
      return res.status(500).send("Error finding book");
    }

    if (!book) {
      return res.status(404).send("Book not found");
    }

    // Filter reviews based on username
    const filteredReviews = book.reviews.filter(review => review.username === username);

    // Check if any reviews found for the user
    if (filteredReviews.length === 0) {
      return res.status(404).send("No reviews found for this user");
    }

    // Update the book document with filtered reviews
    book.reviews = filteredReviews;
    book.save((err) => {
      if (err) {
        return res.status(500).send("Error deleting review");
      }

      res.status(200).send("Review deleted successfully");
    });
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
