/**
 * ============================================================================
 * Branch Controller — CRUD for Company Branches
 * ============================================================================
 *
 * API ENDPOINTS:
 *   GET    /api/branches        → List all active branches (PUBLIC)
 *   GET    /api/branches/:id    → Get branch details (PUBLIC)
 *   POST   /api/branches        → Create a branch (ADMIN only)
 *   PUT    /api/branches/:id    → Update a branch (ADMIN only)
 *   DELETE /api/branches/:id    → Delete a branch (ADMIN only)
 *
 * EXTERNAL SERVICES USED:
 *   - MongoDB Atlas → Stores branch data
 *
 * ============================================================================
 */

const { Branch } = require('../models');

/**
 * @desc    Get all branches
 * @route   GET /api/branches
 * @access  Public
 */
exports.getAllBranches = async (req, res) => {
  try {
    // By default, only show active branches to the public
    const filter = { isActive: true };

    // Anyone can request all branches (including inactive) by passing ?all=true
    if (req.query.all === 'true') {
      delete filter.isActive;
    }

    const branches = await Branch.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    console.error('❌ Get All Branches Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching branches.',
    });
  }
};

/**
 * @desc    Get single branch by ID
 * @route   GET /api/branches/:id
 * @access  Public
 */
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    console.error('❌ Get Branch By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching branch.',
    });
  }
};

/**
 * @desc    Create a new branch
 * @route   POST /api/branches
 * @access  Private (Admin only)
 *
 * REQUEST BODY:
 *   {
 *     "name": "Islamabad",
 *     "location": "Blue Area, Islamabad",
 *     "city": "Islamabad",
 *     "contactPhone": "+92-51-1234567",
 *     "contactEmail": "islamabad@company.com",
 *     "isRemote": false
 *   }
 */
exports.createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Branch created successfully!',
      data: branch,
    });
  } catch (error) {
    console.error('❌ Create Branch Error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A branch with this name already exists.',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating branch.',
    });
  }
};

/**
 * @desc    Update a branch
 * @route   PUT /api/branches/:id
 * @access  Private (Admin only)
 */
exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully!',
      data: branch,
    });
  } catch (error) {
    console.error('❌ Update Branch Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating branch.',
    });
  }
};

/**
 * @desc    Delete a branch (soft delete — sets isActive to false)
 * @route   DELETE /api/branches/:id
 * @access  Private (Admin only)
 *
 * NOTE: We use soft delete instead of hard delete because existing
 *       jobs and applications reference this branch.
 */
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Branch deactivated successfully!',
    });
  } catch (error) {
    console.error('❌ Delete Branch Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting branch.',
    });
  }
};
