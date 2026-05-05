const Note = require("../models/noteModel");

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content, summary, tags, isPinned, folder, reminderDate } = req.body;
    const newNote = new Note({
      user: req.user.id,
      title,
      content,
      summary,
      tags,
      folder: folder || 'General',
      reminderDate,
      isPinned: isPinned || false,
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
    const status = req.query.status || 'active';
    const folder = req.query.folder;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = { user: req.user.id };
    if (folder && folder !== 'All') {
      query.folder = folder;
    }
    if (status === 'active') {
      query.isArchived = false;
      query.isTrashed = false;
    } else if (status === 'archived') {
      query.isArchived = true;
      query.isTrashed = false;
    } else if (status === 'trashed') {
      query.isTrashed = true;
    }

    const sortConfig = { order: 1, isPinned: -1 };
    sortConfig[sortBy] = sortOrder;

    const notes = await Note.find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    const totalNotes = await Note.countDocuments(query);

    res.json({
      notes,
      totalPages: Math.ceil(totalNotes / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all unique folders
exports.getFolders = async (req, res) => {
  try {
    const folders = await Note.distinct('folder', { user: req.user.id, isTrashed: false });
    res.json(folders.filter(f => f));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search notes
exports.searchNotes = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'active';
    const folder = req.query.folder;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const queryObj = {
      user: req.user.id,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    };

    if (folder && folder !== 'All') {
      queryObj.folder = folder;
    }

    if (status === 'active') {
      queryObj.isArchived = false;
      queryObj.isTrashed = false;
    } else if (status === 'archived') {
      queryObj.isArchived = true;
      queryObj.isTrashed = false;
    } else if (status === 'trashed') {
      queryObj.isTrashed = true;
    }

    const sortConfig = { isPinned: -1 };
    sortConfig[sortBy] = sortOrder;

    const notes = await Note.find(queryObj)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);
      
    const totalNotes = await Note.countDocuments(queryObj);
    
    res.json({
      notes,
      totalPages: Math.ceil(totalNotes / limit),
      currentPage: page,
    });
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

// Reorder notes
exports.reorderNotes = async (req, res) => {
  try {
    const { updates } = req.body; // Expects [{ id: "...", order: 0 }, ...]
    
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id, user: req.user.id },
        update: { order: update.order }
      }
    }));
    
    if (bulkOps.length > 0) {
      await Note.bulkWrite(bulkOps);
    }
    
    res.json({ message: "Notes reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const updateData = {};
    const allowedFields = ['title', 'content', 'summary', 'tags', 'isPinned', 'isArchived', 'isTrashed', 'folder', 'isPublic', 'reminderDate'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const currentNote = await Note.findById(req.params.id);
    if (!currentNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Version History tracking
    if (updateData.content !== undefined && updateData.content !== currentNote.content) {
      const version = {
        title: currentNote.title,
        content: currentNote.content,
        summary: currentNote.summary,
        updatedAt: new Date()
      };
      
      const versions = currentNote.versions || [];
      if (versions.length >= 10) {
        versions.shift();
      }
      versions.push(version);
      updateData.versions = versions;
    }

    const updated = await Note.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a note (Soft delete or permanent)
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.isTrashed || req.query.permanent === 'true') {
      await Note.findByIdAndDelete(req.params.id);
      res.json({ message: "Note permanently deleted" });
    } else {
      note.isTrashed = true;
      note.isPinned = false; // Unpin when trashed
      await note.save();
      res.json({ message: "Note moved to trash" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get shared note
exports.getSharedNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || (!note.isPublic && (!req.user || req.user.id !== note.user.toString()))) {
      return res.status(404).json({ message: "Note not found or is private" });
    }
    // Only return safe fields
    res.json({
      title: note.title,
      content: note.content,
      summary: note.summary,
      tags: note.tags,
      folder: note.folder,
      createdAt: note.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: "Invalid note ID" });
  }
};
