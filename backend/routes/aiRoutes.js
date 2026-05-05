const express = require("express");
const router = express.Router();
const { summarizeNote, generateTags, continueWriting, extractActionItems } = require("../controllers/aiController");
const authMiddleware = require("../middlewares/authMiddleware");

// All AI routes require authentication
router.use(authMiddleware);

router.post("/summarize", summarizeNote);
router.post("/tags", generateTags);
router.post("/continue", continueWriting);
router.post("/action-items", extractActionItems);

module.exports = router;
