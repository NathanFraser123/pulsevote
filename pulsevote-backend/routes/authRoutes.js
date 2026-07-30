const express = require("express");
const { body, validationResult } = require("express-validator");

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
  generateJoinCode,
  joinOrganisation
} = require("../controllers/organisationController");

// Poll Controller
const {
  createPoll,
  votePoll,
  getPollResults,
  getOrgPolls,
  closePoll,
  openPoll
} = require("../controllers/pollController");

// Auth Middleware
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Input Validators
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

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// --- POLL ROUTES ---
router.post("/create-poll", protect, requireRole("manager"), createPoll);
router.post("/vote/:pollId", protect, requireRole("user"), votePoll);
router.get("/get-poll-results/:pollId", protect, getPollResults);
router.get("/get-polls/:organisationId", protect, getOrgPolls);
router.post("/close/:pollId", protect, requireRole("manager"), closePoll);
router.post("/open/:pollId", protect, requireRole("manager"), openPoll);

// --- ORGANISATION ROUTES ---
router.post("/create-organisation", protect, requireRole("manager"), createOrganisation);
router.post("/generate-join-code/:organisationId/", protect, requireRole("manager"), generateJoinCode);
router.post("/join-organisation", protect, joinOrganisation);

// --- AUTHENTICATION ROUTES ---
router.post(
  "/register-user",
  [emailValidator, passwordValidator],
  validateRequest,
  registerUser
);

router.post(
  "/register-manager",
  protect,
  requireRole("admin"),
  [emailValidator, passwordValidator],
  validateRequest,
  registerManager
);

router.post(
  "/register-admin",
  [emailValidator, passwordValidator],
  validateRequest,
  registerAdmin
);

router.post(
  "/login",
  [
    emailValidator,
    body("password").notEmpty().withMessage("Password is required")
  ],
  validateRequest,
  login
);

// MUST BE HERE AT THE END:
module.exports = router;