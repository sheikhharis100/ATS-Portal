/**
 * ============================================================================
 * Application Model — MongoDB Mongoose Schema
 * ============================================================================
 *
 * COLLECTION: applications
 * PURPOSE: Tracks each candidate's job application — status, resume, cover letter
 *
 * API USAGE:
 *   - POST   /api/candidate/apply          → Candidate applies for a job
 *   - GET    /api/candidate/applications    → Candidate views their applications
 *   - GET    /api/admin/applications        → Admin views all applications
 *   - GET    /api/admin/applications/:id    → Admin views a specific application
 *   - PUT    /api/admin/applications/:id/status → Admin updates status (shortlist/reject)
 *
 * APPLICATION STATUS FLOW:
 *   Submitted → Under Review → Shortlisted → Interview Scheduled → Selected
 *                                                                  ↘ Rejected (can happen at any stage)
 *
 * CLOUDINARY INTEGRATION:
 *   - resumeUrl and coverLetterUrl store Cloudinary URLs
 *   - These are fetched from the User model at application time, OR
 *     uploaded fresh during the application process
 *
 * ============================================================================
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // ── Candidate (User) Reference ──────────────────────────────────────────
    // ★ Links to the User (candidate) who submitted this application
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
    },

    // ── Job Reference ───────────────────────────────────────────────────────
    // ★ Links to the Job this application is for
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },

    // ── Branch Reference ────────────────────────────────────────────────────
    // ★ Denormalized from Job for faster querying
    // (so we can filter applications by branch without joining Job collection)
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },

    // ── Application Status ──────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        'Submitted',         // Initial status when candidate applies
        'Under Review',      // HR is reviewing the application
        'Shortlisted',       // HR has shortlisted the candidate
        'Interview Scheduled', // Interview has been scheduled (Part 2)
        'Selected',          // Candidate has been selected
        'Rejected',          // Candidate has been rejected
      ],
      default: 'Submitted',
    },

    // ── Resume URL ──────────────────────────────────────────────────────────
    // ★ CLOUDINARY URL — Snapshot of candidate's resume at the time of application
    // We store this here (even though User model also has it) because:
    //   1. Candidate might update their resume later, but this application
    //      should keep the version they applied with
    //   2. Faster to query — no need to join User collection just for resume URL
    resumeUrl: {
      type: String,
      default: '',
    },

    // ── Cover Letter URL ────────────────────────────────────────────────────
    // ★ CLOUDINARY URL — Same logic as resumeUrl above
    coverLetterUrl: {
      type: String,
      default: '',
    },

    // ── Candidate Snapshot ──────────────────────────────────────────────────
    // Denormalized data — stores candidate's name and email at application time
    // Useful for quick display in admin panel without joining User collection
    candidateName: {
      type: String,
      required: true,
    },

    candidateEmail: {
      type: String,
      required: true,
    },

    // ── Cover Note / Message from Candidate ─────────────────────────────────
    coverNote: {
      type: String,
      default: '',
      // Optional message the candidate adds when applying
    },

    // ── Admin Notes ─────────────────────────────────────────────────────────
    // HR/Admin can add notes about this application
    adminNotes: {
      type: String,
      default: '',
    },

    // ── Status History ──────────────────────────────────────────────────────
    // Tracks when and why the status changed — audit trail
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'Submitted',
            'Under Review',
            'Shortlisted',
            'Interview Scheduled',
            'Selected',
            'Rejected',
          ],
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // The admin who changed the status
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
applicationSchema.index({ candidate: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ branch: 1 });
// ★ Compound index — prevent a candidate from applying to the same job twice
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
