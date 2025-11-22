const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  abstract: {
    type: String,
    required: [true, 'Abstract is required'],
    trim: true
  },
  authors: {
    type: [String],
    required: [true, 'At least one author is required'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one author is required'
    }
  },
  publicationYear: {
    type: Number,
    required: [true, 'Publication year is required'],
    min: [1900, 'Publication year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Publication year cannot be in the future']
  },
  studyField: {
    type: String,
    required: [true, 'Study field is required'],
    trim: true
  },
  journalFileUrl: {
    type: String,
    required: [true, 'Journal file is required']
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for text search
publicationSchema.index({ title: 'text', abstract: 'text' });

module.exports = mongoose.model('Publication', publicationSchema);
