const Note = require("../models/noteModel");

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({
      user: req.user.id,
      title,
      content,
      createdAt: new Date(),
    });
    await newNote.save();
    res.status(201).json({ message: "Note created successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ user: req.user.id })
      .skip(skip)
      .limit(limit);

    const totalNotes = await Note.countDocuments({ user: req.user.id });

    res.json({
      notes,
      totalPages: Math.ceil(totalNotes / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search notes
exports.searchNotes = async (req, res) => {
  try {
    const { query } = req.query;
    const notes = await Note.find({
      user: req.user.id,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single note
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const updated = await Note.findByIdAndUpdate(req.params.id, {
      title,
      content,
    });
    if (!updated) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
