const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);