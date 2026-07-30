const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      email,
      password,
      roles: [{ organisationId: null, role: "user" }]
    });

    const token = generateToken(user);
    res.status(201).json({ message: "User registered", token });
  } catch (err) {
    res.status(500).json({ error: "Server error " + err });
  }
};

exports.registerManager = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.roles.some((r) => r.role === "admin")) {
      return res.status(403).json({ message: "Only admins can create managers" });
    }

    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const managerUser = await User.create({
      email,
      password,
      roles: [{ organisationId: null, role: "manager" }]
    });

    const token = generateToken(managerUser);
    res.status(201).json({ message: "Manager registered", token });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err });
  }
};

exports.registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  try {
    const { email, password } = req.body;

    const adminExists = await User.exists({ "roles.role": "admin" });

    if (adminExists) {
      const requestingUser = await User.findById(req.user.id);
      const isAdmin = requestingUser?.roles?.some((r) => r.role === "admin");
      if (!isAdmin) {
        return res.status(403).json({ message: "Only admins can create admins" });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const adminUser = await User.create({
      email,
      password,
      roles: [{ organisationId: null, role: "admin" }]
    });

    const token = generateToken(adminUser);
    return res.status(201).json({ message: "Admin registered", token });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Role authorization middleware
exports.requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ message: "User not found" });

      if (role === "admin") {
        const isAdmin = user.roles.some((r) => r.role === "admin");
        if (!isAdmin) return res.status(403).json({ message: "Forbidden" });
        return next();
      }

      const orgId = req.params.organisationId || req.body.organisationId;

      const hasRole = user.roles.some(
        (r) =>
          r.role === role && (!orgId || r.organisationId?.toString() === orgId)
      );

      if (!hasRole && !user.roles.some((r) => r.role === "admin")) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  };
};