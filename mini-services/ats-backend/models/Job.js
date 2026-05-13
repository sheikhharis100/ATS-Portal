/**
 * ============================================================================
 * Job Model — MongoDB Mongoose Schema
 * ============================================================================
 *
 * COLLECTION: jobs
 * PURPOSE: Stores job postings created by HR/Admin
 *
 * API USAGE:
 *   - GET    /api/jobs             → List all active jobs (PUBLIC — no auth needed)
 *   - GET    /api/jobs/:id         → Get job details (PUBLIC — no auth needed)
 *   - GET    /api/jobs?branch=X    → Filter jobs by branch (PUBLIC)
 *   - GET    /api/jobs?department=Y → Filter jobs by department (PUBLIC)
 *   - POST   /api/jobs             → Create a new job (ADMIN only)
 *   - PUT    /api/jobs/:id         → Update a job (ADMIN only)
 *   - DELETE /api/jobs/:id         → Delete a job (ADMIN only)
 *
 * RELATIONSHIPS:
 *   - jobs.branch → references Branch._id (which city/office this job belongs to)
 *   - Applications reference this Job via applications.job → Job._id
 *
 * ============================================================================
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // ── Job Title ───────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      // Examples: "React Developer", "UI/UX Designer", "Project Manager"
    },

    // ── Job Description ─────────────────────────────────────────────────────
    description: {
      type: String,
      required: [true, 'Job description is required'],
      // Full job description — responsibilities, requirements, etc.
    },

    // ── Department ──────────────────────────────────────────────────────────
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      // Examples: "Engineering", "Design", "Marketing", "HR"
    },

    // ── Branch Reference ────────────────────────────────────────────────────
    // ★ This links the job to a specific branch (Islamabad, Lahore, etc.)
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch', // References the Branch model
      required: [true, 'Branch is required'],
    },

    // ── Employment Type ─────────────────────────────────────────────────────
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },

    // ── Experience Level ────────────────────────────────────────────────────
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager'],
      default: 'Entry Level',
    },

    // ── Salary Range ────────────────────────────────────────────────────────
    salaryMin: {
      type: Number,
      default: 0,
    },

    salaryMax: {
      type: Number,
      default: 0,
    },

    // ── Available Seats ─────────────────────────────────────────────────────
    // How many positions are open for this job
    availableSeats: {
      type: Number,
      required: [true, 'Number of available seats is required'],
      min: [1, 'Must have at least 1 available seat'],
    },

    // ── Required Skills ─────────────────────────────────────────────────────
    skills: {
      type: [String],
      default: [],
      // e.g., ["React", "Node.js", "MongoDB", "REST API"]
    },

    // ── Application Deadline ────────────────────────────────────────────────
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },

    // ── Job Status ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['Open', 'Closed', 'Paused'],
      default: 'Open',
      // "Open" = candidates can apply
      // "Closed" = no more applications accepted
      // "Paused" = temporarily not accepting applications
    },

    // ── Created By (Admin) ──────────────────────────────────────────────────
    // ★ Tracks which admin created this job posting
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for faster search/filter queries ────────────────────────────────
jobSchema.index({ branch: 1 });
jobSchema.index({ department: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ deadline: 1 });

module.exports = mongoose.model('Job', jobSchema);
