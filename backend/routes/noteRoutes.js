const express = require("express");
const router = express.Router();
const {
  createNote,
  getAllNotes,
  searchNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", createNote);
router.get("/", getAllNotes);
router.get("/search", searchNotes);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
