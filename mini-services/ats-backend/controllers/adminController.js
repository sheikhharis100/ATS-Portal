/**
 * Admin Controller — Dashboard, Applications, Interviews Management
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Branch = require('../models/Branch');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const { sendStatusUpdateEmail, sendInterviewEmail } = require('../utils/emailService');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalJobs,
      openJobs,
      totalApplications,
      totalCandidates,
      totalBranches,
      applicationsByStatus,
      totalInterviews,
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'Open' }),
      Application.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      Branch.countDocuments({ isActive: true }),
      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Interview.countDocuments({ status: 'Scheduled' }),
    ]);

    // Convert aggregation result to object
    const byStatus = {};
    applicationsByStatus.forEach((item) => {
      // Convert status to camelCase key
      const key = item._id.replace(/\s+/g, '').replace(/^-/, '');
      byStatus[key] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        jobs: {
          total: totalJobs,
          open: openJobs,
        },
        applications: {
          total: totalApplications,
          byStatus,
        },
        candidates: totalCandidates,
        branches: totalBranches,
        interviews: totalInterviews,
      },
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats.',
    });
  }
};

// @desc    Get all applications (with filters & pagination)
// @route   GET /api/admin/applications
exports.getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.job) {
      filter.job = req.query.job;
    }

    if (req.query.branch) {
      filter.branch = req.query.branch;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { candidateName: searchRegex },
        { candidateEmail: searchRegex },
      ];
    }

    const applications = await Application.find(filter)
      .populate('job', 'title department')
      .populate('branch', 'name city')
      .populate('candidate', 'name email phone profilePicture skills experience education')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: applications.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
      data: applications,
    });
  } catch (error) {
    console.error('Get All Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications.',
    });
  }
};

// @desc    Get single application
// @route   GET /api/admin/applications/:id
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title department description employmentType experienceLevel salaryMin salaryMax skills deadline')
      .populate('branch', 'name city location contactPhone contactEmail')
      .populate('candidate', 'name email phone profilePicture resume coverLetter skills experience education');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Get interview if exists
    const interview = await Interview.findOne({ application: application._id });

    const appData = application.toObject();
    appData.interview = interview || null;

    res.status(200).json({
      success: true,
      data: appData,
    });
  } catch (error) {
    console.error('Get Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application.',
    });
  }
};

// @desc    Update application status
// @route   PUT /api/admin/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.',
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Update status
    application.status = status;

    // Add to status history
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || '',
    });

    // Add admin notes if provided
    if (note) {
      application.adminNotes = note;
    }

    await application.save();

    // Populate for response
    await application.populate('job', 'title department');
    await application.populate('branch', 'name city');
    await application.populate('candidate', 'name email');

    // Send email notification (non-blocking)
    const emailStatuses = ['Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
    if (emailStatuses.includes(status) && application.candidate?.email) {
      sendStatusUpdateEmail({
        candidateEmail: application.candidate.email,
        candidateName: application.candidate.name || application.candidateName,
        jobTitle: application.job?.title || 'the position',
        status,
        note: note || '',
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully!',
      data: application,
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTERVIEW MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @desc    Schedule an interview
// @route   POST /api/admin/interviews
exports.scheduleInterview = async (req, res) => {
  try {
    const {
      application: applicationId,
      interviewDate,
      interviewTime,
      interviewType,
      location,
      interviewer,
      message,
    } = req.body;

    // Verify application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Check if interview already exists for this application
    const existingInterview = await Interview.findOne({ application: applicationId, status: 'Scheduled' });
    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message: 'An active interview already exists for this application.',
      });
    }

    // Create interview
    const interview = await Interview.create({
      application: applicationId,
      candidate: application.candidate,
      job: application.job,
      interviewDate,
      interviewTime,
      interviewType: interviewType || 'On-site',
      location: location || '',
      interviewer: interviewer || '',
      message: message || '',
      status: 'Scheduled',
      scheduledBy: req.user._id,
    });

    // Update application status to "Interview Scheduled"
    application.status = 'Interview Scheduled';
    application.statusHistory.push({
      status: 'Interview Scheduled',
      changedBy: req.user._id,
      changedAt: new Date(),
      note: `Interview scheduled for ${interviewDate} at ${interviewTime} (${interviewType})`,
    });
    await application.save();

    await interview.populate('candidate', 'name email');
    await interview.populate('job', 'title department');

    // Send interview invitation email (non-blocking)
    if (interview.candidate?.email) {
      sendInterviewEmail({
        candidateEmail: interview.candidate.email,
        candidateName: interview.candidate.name || application.candidateName,
        jobTitle: interview.job?.title || 'the position',
        interviewDate,
        interviewTime,
        interviewType: interviewType || 'On-site',
        location: location || '',
        interviewer: interviewer || '',
        message: message || '',
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully!',
      data: interview,
    });
  } catch (error) {
    console.error('Schedule Interview Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling interview.',
    });
  }
};

// @desc    Get all interviews
// @route   GET /api/admin/interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const interviews = await Interview.find(filter)
      .populate('candidate', 'name email phone profilePicture')
      .populate('job', 'title department')
      .populate('application', 'status candidateName candidateEmail')
      .populate('scheduledBy', 'name')
      .sort({ interviewDate: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    console.error('Get Interviews Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interviews.',
    });
  }
};

// @desc    Update interview
// @route   PUT /api/admin/interviews/:id
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.',
      });
    }

    const allowedFields = ['interviewDate', 'interviewTime', 'interviewType', 'location', 'interviewer', 'message', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        interview[field] = req.body[field];
      }
    });

    await interview.save();

    await interview.populate('candidate', 'name email');
    await interview.populate('job', 'title department');

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully!',
      data: interview,
    });
  } catch (error) {
    console.error('Update Interview Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating interview.',
    });
  }
};

// @desc    Cancel interview
// @route   DELETE /api/admin/interviews/:id
exports.cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.',
      });
    }

    // Update interview status
    interview.status = 'Cancelled';
    await interview.save();

    // Move application back to Shortlisted
    const application = await Application.findById(interview.application);
    if (application) {
      application.status = 'Shortlisted';
      application.statusHistory.push({
        status: 'Shortlisted',
        changedBy: req.user._id,
        changedAt: new Date(),
        note: 'Interview was cancelled. Application moved back to Shortlisted.',
      });
      await application.save();
    }

    res.status(200).json({
      success: true,
      message: 'Interview cancelled. Application moved back to Shortlisted.',
      data: interview,
    });
  } catch (error) {
    console.error('Cancel Interview Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling interview.',
    });
  }
};
