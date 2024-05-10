const Note = require('../models/noteModel');

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({
      title,
      content,
      createdAt: new Date()
    });
    await newNote.save();
    res.status(201).json({ message: 'Note created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
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
      return res.status(404).json({ message: 'Note not found' });
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
      content
    });
    if (!updated) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};