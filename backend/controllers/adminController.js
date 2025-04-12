const User = require("../models/userModel");
const Note = require("../models/noteModel");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("-password")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({});

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { roles } = req.body;
    
    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ message: "Roles must be provided as an array" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roles },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Delete all notes associated with this user
    await Note.deleteMany({ user: req.params.id });
    
    res.json({ message: "User and associated notes deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all notes (admin only)
exports.getAllNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find({})
      .populate("user", "email")
      .skip(skip)
      .limit(limit);

    const totalNotes = await Note.countDocuments({});

    res.json({
      notes,
      totalPages: Math.ceil(totalNotes / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user statistics (admin only)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalNotes = await Note.countDocuments({});
    
    // Users per role
    const adminUsers = await User.countDocuments({ roles: "admin" });
    const regularUsers = await User.countDocuments({ roles: { $nin: ["admin"] } });
    
    // Top users with most notes (limited to top 5)
    const topUsers = await Note.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          email: { $arrayElemAt: ["$userDetails.email", 0] }
        }
      }
    ]);
    
    res.json({
      totalUsers,
      totalNotes,
      userRoles: {
        admin: adminUsers,
        regular: regularUsers
      },
      topUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};