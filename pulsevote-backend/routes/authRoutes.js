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
router.post("/polls/create-poll", protect, requireRole("manager"), createPoll);
router.post("/polls/vote/:pollId", protect, requireRole("user"), votePoll);
router.get("/polls/get-poll-results/:pollId", protect, getPollResults);
router.get("/polls/get-polls/:organisationId", protect, getOrgPolls);
router.post("/polls/close/:pollId", protect, requireRole("manager"), closePoll);
router.post("/polls/open/:pollId", protect, requireRole("manager"), openPoll);

// --- ORGANISATION ROUTES ---
router.post("/organisations/create-organisation", protect, requireRole("manager"), createOrganisation);
router.post("/organisations/generate-join-code/:organisationId/", protect, requireRole("manager"), generateJoinCode);
router.post("/organisations/join-organisation", protect, joinOrganisation);

// --- AUTHENTICATION ROUTES ---
router.post(
  "/auth/register-user",
  [emailValidator, passwordValidator],
  validateRequest,
  registerUser
);

router.post(
  "/auth/register-manager",
  protect,
  requireRole("admin"),
  [emailValidator, passwordValidator],
  validateRequest,
  registerManager
);

router.post(
  "/auth/register-admin",
  [emailValidator, passwordValidator],
  validateRequest,
  registerAdmin
);

router.post(
  "/auth/login",
  [
    emailValidator,
    body("password").notEmpty().withMessage("Password is required")
  ],
  validateRequest,
  login
);

module.exports = router;