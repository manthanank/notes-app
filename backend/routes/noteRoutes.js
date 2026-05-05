const express = require("express");
const router = express.Router();
const {
  createNote,
  getAllNotes,
  searchNotes,
  getNote,
  getFolders,
  updateNote,
  deleteNote,
  getSharedNote,
  reorderNotes
} = require("../controllers/noteController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public route for shared notes
router.get("/shared/:id", getSharedNote);

router.use(authMiddleware);

router.post("/reorder", reorderNotes);
router.post("/", createNote);
router.get("/folders", getFolders);
router.get("/", getAllNotes);
router.get("/search", searchNotes);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
