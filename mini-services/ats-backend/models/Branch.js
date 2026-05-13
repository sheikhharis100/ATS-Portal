/**
 * ============================================================================
 * Branch Model — MongoDB Mongoose Schema
 * ============================================================================
 *
 * COLLECTION: branches
 * PURPOSE: Stores company branch locations (Islamabad, Lahore, Karachi, Remote)
 *
 * API USAGE:
 *   - GET    /api/branches        → List all branches (PUBLIC — no auth needed)
 *   - POST   /api/branches        → Create a new branch (ADMIN only)
 *   - PUT    /api/branches/:id    → Update a branch (ADMIN only)
 *   - DELETE /api/branches/:id    → Delete a branch (ADMIN only)
 *
 * RELATIONSHIPS:
 *   - A Job belongs to one Branch (jobs.branch references Branch._id)
 *   - One Branch can have many Jobs
 *
 * ============================================================================
 */

const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    // ── Branch Name ─────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      unique: true,
      trim: true,
      // Examples: "Islamabad", "Lahore", "Karachi", "Remote"
    },

    // ── Branch Location / Address ───────────────────────────────────────────
    location: {
      type: String,
      required: [true, 'Branch location/address is required'],
      trim: true,
      // Examples: "Blue Area, Islamabad", "Johar Town, Lahore"
    },

    // ── Branch City ─────────────────────────────────────────────────────────
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },

    // ── Contact Information ─────────────────────────────────────────────────
    contactPhone: {
      type: String,
      default: '',
    },

    contactEmail: {
      type: String,
      default: '',
    },

    // ── Is Remote Branch? ───────────────────────────────────────────────────
    isRemote: {
      type: Boolean,
      default: false,
      // "Remote" branch has isRemote = true, others have false
    },

    // ── Active Status ───────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      // Inactive branches won't show in public job listings
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Branch', branchSchema);
