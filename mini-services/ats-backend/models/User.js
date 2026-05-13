/**
 * User Model — MongoDB Mongoose Schema
 * Stores both Candidate and HR/Admin user accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: ['candidate', 'admin'],
      default: 'candidate',
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    // Profile Picture — Cloudinary URL
    profilePicture: {
      type: String,
      default: '',
    },

    profilePicturePublicId: {
      type: String,
      default: '',
    },

    // Resume — Cloudinary URL (PDF only)
    resume: {
      type: String,
      default: '',
    },

    resumePublicId: {
      type: String,
      default: '',
    },

    // Cover Letter — Plain text (NOT a file upload)
    coverLetter: {
      type: String,
      default: '',
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: '',
    },

    education: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

// Pre-save Hook: Hash Password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance Method: Compare Password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance Method: Get Safe Profile
userSchema.methods.getSafeProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
