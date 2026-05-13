/**
 * ============================================================================
 * Auth Controller — Registration & Login
 * ============================================================================
 *
 * API ENDPOINTS:
 *   POST /api/auth/register  → Register a new user (default role: candidate)
 *   POST /api/auth/login     → Login and receive JWT token
 *   GET  /api/auth/me        → Get current logged-in user info
 *
 * EXTERNAL SERVICES USED:
 *   - JWT (jsonwebtoken)     → Generates authentication tokens
 *   - bcryptjs               → Password hashing & comparison
 *   - MongoDB Atlas          → Stores user data
 *
 * FLOW:
 *   Register: User submits name/email/password → Validate → Hash password →
 *             Save to DB → Return JWT token
 *
 *   Login:    User submits email/password → Find user → Compare password →
 *             Return JWT token
 *
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Helper: Generate JWT Token
 * ★ This uses JWT_SECRET and JWT_EXPIRE from the .env file
 *
 * @param {String} id - User's MongoDB _id
 * @returns {String} Signed JWT token
 */
const generateToken = (id) => {
  // ★ JWT_SECRET — Must be set in .env file (long random string)
  // ★ JWT_EXPIRE — Token validity period (e.g., "7d" = 7 days)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (no authentication needed)
 *
 * REQUEST BODY:
 *   {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "password": "password123",
 *     "role": "candidate"    ← optional, defaults to "candidate"
 *   }
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ── Validate required fields ──────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // ── Check if user already exists ──────────────────────────────────────
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ── Create the user ───────────────────────────────────────────────────
    // Password hashing is handled automatically by the User model pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate', // Default to candidate if not specified
    });

    // ── Generate JWT token and respond ────────────────────────────────────
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

/**
 * @desc    Login user and return JWT token
 * @route   POST /api/auth/login
 * @access  Public (no authentication needed)
 *
 * REQUEST BODY:
 *   {
 *     "email": "john@example.com",
 *     "password": "password123"
 *   }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validate required fields ──────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // ── Find user by email ────────────────────────────────────────────────
    // ★ We use .select('+password') because password has select:false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Compare passwords using the model method ──────────────────────────
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Check if account is active ────────────────────────────────────────
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // ── Generate JWT token and respond ────────────────────────────────────
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * @desc    Get current logged-in user's info
 * @route   GET /api/auth/me
 * @access  Private (requires JWT token)
 *
 * HEADERS:
 *   Authorization: Bearer <token>
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the "protect" middleware
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        resume: user.resume,
        coverLetter: user.coverLetter,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
      },
    });
  } catch (error) {
    console.error('❌ Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};
