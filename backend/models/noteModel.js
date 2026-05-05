const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: String,
  summary: String,
  tags: [String],
  folder: { type: String, default: 'General' },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  reminderDate: { type: Date },
  versions: [{
    title: String,
    content: String,
    summary: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", noteSchema);
