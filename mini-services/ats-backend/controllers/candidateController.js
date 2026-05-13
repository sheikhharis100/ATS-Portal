/**
 * Candidate Controller — Profile & Job Applications
 * Cover letter is now plain text (not file upload)
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Get candidate's own profile
// @route   GET /api/candidate/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        resume: user.resume,
        coverLetter: user.coverLetter,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile.',
    });
  }
};

// @desc    Update candidate's profile (text fields only)
// @route   PUT /api/candidate/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'skills', 'experience', 'education'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile.',
    });
  }
};

// @desc    Upload profile picture to Cloudinary
// @route   PUT /api/candidate/profile/picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a profile picture.',
      });
    }

    const user = await User.findById(req.user._id);

    if (user.profilePicturePublicId) {
      await deleteFromCloudinary(user.profilePicturePublicId, 'image');
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'ats/profile-pictures',
      'image'
    );

    user.profilePicture = result.url;
    user.profilePicturePublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully!',
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Upload Profile Picture Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading profile picture.',
    });
  }
};

// @desc    Upload resume (PDF) to Cloudinary
// @route   PUT /api/candidate/resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF).',
      });
    }

    const user = await User.findById(req.user._id);

    if (user.resumePublicId) {
      await deleteFromCloudinary(user.resumePublicId, 'raw');
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'ats/resumes',
      'raw'
    );

    user.resume = result.url;
    user.resumePublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!',
      data: {
        resume: user.resume,
      },
    });
  } catch (error) {
    console.error('Upload Resume Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading resume.',
    });
  }
};

// @desc    Update cover letter (PLAIN TEXT, not file upload)
// @route   PUT /api/candidate/cover-letter
exports.updateCoverLetter = async (req, res) => {
  try {
    const { coverLetter } = req.body;

    if (coverLetter === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide cover letter text.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { coverLetter },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cover letter updated successfully!',
      data: {
        coverLetter: user.coverLetter,
      },
    });
  } catch (error) {
    console.error('Update Cover Letter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cover letter.',
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/candidate/apply/:jobId
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user._id;

    const job = await Job.findById(jobId).populate('branch');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications.',
      });
    }

    const existingApplication = await Application.findOne({
      candidate: candidateId,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job.',
      });
    }

    const candidate = await User.findById(candidateId);

    if (!candidate.resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume before applying for a job.',
      });
    }

    const application = await Application.create({
      candidate: candidateId,
      job: jobId,
      branch: job.branch._id,
      resumeUrl: candidate.resume,
      coverLetterUrl: candidate.coverLetter, // This is plain text content now
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      coverNote: req.body.coverNote || '',
      statusHistory: [
        {
          status: 'Submitted',
          changedAt: new Date(),
          note: 'Application submitted by candidate',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: application,
    });
  } catch (error) {
    console.error('Apply For Job Error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while applying for job.',
    });
  }
};

// @desc    Get all applications for the logged-in candidate
// @route   GET /api/candidate/applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title department employmentType experienceLevel status deadline')
      .populate('branch', 'name city isRemote')
      .sort({ createdAt: -1 });

    // Also fetch any interviews for these applications
    const appIds = applications.map(app => app._id);
    const interviews = await Interview.find({ application: { $in: appIds } });

    // Attach interview data to applications
    const appsWithInterviews = applications.map(app => {
      const appObj = app.toObject();
      appObj.interview = interviews.find(i => i.application.toString() === app._id.toString()) || null;
      return appObj;
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: appsWithInterviews,
    });
  } catch (error) {
    console.error('Get My Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications.',
    });
  }
};

// @desc    Get a single application detail
// @route   GET /api/candidate/applications/:id
exports.getApplicationDetail = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id,
    })
      .populate('job', 'title department description employmentType experienceLevel salaryMin salaryMax skills deadline')
      .populate('branch', 'name city location isRemote');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Fetch interview if exists
    const interview = await Interview.findOne({ application: application._id });

    const appData = application.toObject();
    appData.interview = interview || null;

    res.status(200).json({
      success: true,
      data: appData,
    });
  } catch (error) {
    console.error('Get Application Detail Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application.',
    });
  }
};
