const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

// Apply authentication and admin check middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// User management
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

// Note management
router.get("/notes", adminController.getAllNotes);

// Statistics
router.get("/stats", adminController.getUserStats);

module.exports = router;