/**
 * Interview Model — MongoDB Mongoose Schema (FULLY ACTIVE)
 * Stores interview schedules with full CRUD support
 */

const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    interviewDate: {
      type: Date,
      required: [true, 'Interview date is required'],
    },

    interviewTime: {
      type: String,
      required: [true, 'Interview time is required'],
    },

    interviewType: {
      type: String,
      enum: ['On-site', 'Online', 'Phone'],
      default: 'On-site',
    },

    // For on-site: physical location; For online: meeting link
    location: {
      type: String,
      default: '',
    },

    interviewer: {
      type: String,
      default: '',
    },

    // Message from HR to candidate about the interview
    message: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },

    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ candidate: 1 });
interviewSchema.index({ job: 1 });
interviewSchema.index({ application: 1 });
interviewSchema.index({ interviewDate: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
