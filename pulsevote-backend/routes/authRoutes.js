const express = require("express");
const { body, validationResult } = require("express-validator");

// Rate Limiters
const { registerLimiter, loginLimiter } = require("../middleware/rateLimiter");

// Auth Controller
const {
  registerUser,
  registerManager,
  registerAdmin,
  login,
  requireRole
} = require("../controllers/authController");

// Organisation Controller
const {
  createOrganisation,
  getMyOrganisations,
  generateJoinCode,
  joinOrganisation
} = require("../controllers/organisationController");

// Poll Controller (Updated to match exact file casing: PollController.js)
const {
  createPoll,
  votePoll,
  getPollResults,
  getOrgPolls,
  closePoll,
  openPoll
} = require("../controllers/PollController");

// Auth Middleware
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// --- VALIDATION MIDDLEWARE ---
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// --- INPUT VALIDATORS ---
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

const createOrgValidator = body("name")
  .trim()
  .notEmpty()
  .withMessage("Organisation name is required");

const joinOrgValidator = body("joinCode")
  .trim()
  .notEmpty()
  .withMessage("Join code is required");

const createPollValidator = [
  body("organisationId")
    .trim()
    .notEmpty()
    .withMessage("Organisation ID is required"),
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Poll question is required"),
  body("options")
    .isArray({ min: 2 })
    .withMessage("A poll must have at least 2 options")
];

const votePollValidator = [
  body("optionIndex")
    .isInt({ min: 0 })
    .withMessage("A valid option choice is required")
];

// --- AUTHENTICATION ROUTES ---
router.post(
  "/auth/register-user",
  registerLimiter,
  [emailValidator, passwordValidator],
  validateRequest,
  registerUser
);

router.post(
  "/auth/register-manager",
  protect,
  requireRole("admin"),
  registerLimiter,
  [emailValidator, passwordValidator],
  validateRequest,
  registerManager
);

router.post(
  "/auth/register-admin",
  registerLimiter,
  [emailValidator, passwordValidator],
  validateRequest,
  registerAdmin
);

router.post(
  "/auth/login",
  loginLimiter,
  [
    emailValidator,
    body("password").notEmpty().withMessage("Password is required").trim()
  ],
  validateRequest,
  login
);

// --- ORGANISATION ROUTES ---
router.get(
  "/organisations/my-organisations",
  protect,
  getMyOrganisations
);

router.post(
  "/organisations/create-organisation",
  protect,
  requireRole("manager"),
  createOrgValidator,
  validateRequest,
  createOrganisation
);

router.post(
  "/organisations/generate-join-code/:organisationId",
  protect,
  requireRole("manager"),
  generateJoinCode
);

router.post(
  "/organisations/join-organisation",
  protect,
  joinOrgValidator,
  validateRequest,
  joinOrganisation
);

// --- POLL ROUTES ---
router.post(
  "/polls/create-poll",
  protect,
  requireRole("manager"),
  createPollValidator,
  validateRequest,
  createPoll
);

router.post(
  "/polls/vote/:pollId",
  protect,
  requireRole("user"),
  votePollValidator,
  validateRequest,
  votePoll
);

router.get(
  "/polls/get-poll-results/:pollId",
  protect,
  getPollResults
);

router.get(
  "/polls/get-polls/:organisationId",
  protect,
  getOrgPolls
);

router.post(
  "/polls/close/:pollId",
  protect,
  requireRole("manager"),
  closePoll
);

router.post(
  "/polls/open/:pollId",
  protect,
  requireRole("manager"),
  openPoll
);

module.exports = router;