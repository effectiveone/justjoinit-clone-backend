// Import the necessary modules
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Create a route for user signup
router.post("/signup", userController.signup);

// Create a route for user login
router.post("/login", userController.login);

// Export the router to be used in other files
module.exports = router;
