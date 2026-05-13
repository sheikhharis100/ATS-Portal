/**
 * ============================================================================
 * Job Controller — CRUD Operations for Job Postings
 * ============================================================================
 *
 * API ENDPOINTS:
 *   GET    /api/jobs           → List all jobs (PUBLIC — no login needed)
 *   GET    /api/jobs/:id       → Get single job details (PUBLIC)
 *   POST   /api/jobs           → Create a new job (ADMIN only)
 *   PUT    /api/jobs/:id       → Update a job (ADMIN only)
 *   DELETE /api/jobs/:id       → Delete a job (ADMIN only)
 *
 * QUERY PARAMETERS (for GET /api/jobs):
 *   ?branch=<branchId>       → Filter by branch
 *   ?department=<name>       → Filter by department
 *   ?status=Open             → Filter by status
 *   ?search=<keyword>        → Search in title/description
 *   ?page=1&limit=10         → Pagination
 *
 * EXTERNAL SERVICES USED:
 *   - MongoDB Atlas  → Stores job data
 *   - Mongoose       → ODM for MongoDB queries
 *
 * ============================================================================
 */

const { Job, Branch } = require('../models');

/**
 * @desc    Get all jobs (with filtering, search, and pagination)
 * @route   GET /api/jobs
 * @access  Public
 *
 * This is the main endpoint for the Public Career Portal.
 * Anyone can view active job listings without logging in.
 */
exports.getAllJobs = async (req, res) => {
  try {
    // ── Build filter object based on query parameters ─────────────────────
    // status=all (admin) → no status filter; explicit value → exact match; default → Open only
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    } else if (!req.query.status) {
      filter.status = 'Open';
    }

    // Filter by branch (branch ID)
    if (req.query.branch) {
      filter.branch = req.query.branch;
    }

    // Filter by department
    if (req.query.department) {
      filter.department = req.query.department;
    }

    // Filter by employment type
    if (req.query.employmentType) {
      filter.employmentType = req.query.employmentType;
    }

    // Filter by experience level
    if (req.query.experienceLevel) {
      filter.experienceLevel = req.query.experienceLevel;
    }

    // ── Search in title and description ───────────────────────────────────
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { skills: { $in: [new RegExp(req.query.search, 'i')] } },
      ];
    }

    // ── Pagination ────────────────────────────────────────────────────────
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // ── Execute query with populated branch info ──────────────────────────
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('branch', 'name city location isRemote') // Include branch details
      .populate('createdBy', 'name email')               // Include admin who created it
      .sort({ createdAt: -1 })                             // Newest first
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: jobs,
    });
  } catch (error) {
    console.error('❌ Get All Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs.',
    });
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('branch', 'name city location isRemote contactPhone contactEmail')
      .populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('❌ Get Job By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job.',
    });
  }
};

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Admin only)
 *
 * REQUEST BODY:
 *   {
 *     "title": "React Developer",
 *     "description": "We are looking for...",
 *     "department": "Engineering",
 *     "branch": "64abc...",           ← MongoDB ObjectId of the branch
 *     "employmentType": "Full-time",
 *     "experienceLevel": "Mid Level",
 *     "salaryMin": 80000,
 *     "salaryMax": 150000,
 *     "availableSeats": 3,
 *     "skills": ["React", "Node.js"],
 *     "deadline": "2025-12-31"
 *   }
 */
exports.createJob = async (req, res) => {
  try {
    // Add the current admin user as the creator
    req.body.createdBy = req.user._id;

    // ── Verify the branch exists ──────────────────────────────────────────
    const branch = await Branch.findById(req.body.branch);
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID. Branch not found.',
      });
    }

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully!',
      data: job,
    });
  } catch (error) {
    console.error('❌ Create Job Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating job.',
    });
  }
};

/**
 * @desc    Update an existing job posting
 * @route   PUT /api/jobs/:id
 * @access  Private (Admin only)
 */
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Update the job with the request body
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           // Return the updated document
      runValidators: true, // Run schema validators on update
    }).populate('branch', 'name city location');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully!',
      data: job,
    });
  } catch (error) {
    console.error('❌ Update Job Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating job.',
    });
  }
};

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/jobs/:id
 * @access  Private (Admin only)
 */
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully!',
    });
  } catch (error) {
    console.error('❌ Delete Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job.',
    });
  }
};
