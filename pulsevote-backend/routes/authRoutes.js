const express = require("express");
const { body, validationResult } = require("express-validator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Define validator rules
const emailValidator = body("email")
  .isEmail()
  .withMessage("Email must be valid")
  .normalizeEmail();

const passwordValidator = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Za-z]/)
  .withMessage("Password must include a letter")
  .matches(/\d/)
  .withMessage("Password must include a number")
  .trim();

// Middleware to catch validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Returns the first validation error message to match your React frontend err.response.data.message
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Routes with middleware chain
router.post("/register", [emailValidator, passwordValidator], register);
router.post("/login", [emailValidator, body("password").notEmpty().trim().escape()], login);

module.exports = router;