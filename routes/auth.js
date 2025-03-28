const express = require("express");
const { register, getAuthToken } = require("../Controllers/authController.js");

const router = express.Router();

// Routes
router.post("/register", register);
router.post("/auth", getAuthToken);

module.exports = router;
