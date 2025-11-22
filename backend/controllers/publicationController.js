const Publication = require('../models/Publication');
const fs = require('fs');
const path = require('path');

// @desc    Create new publication
// @route   POST /api/publications
// @access  Private
const createPublication = async (req, res) => {
  try {
    const { title, abstract, authors, publicationYear, studyField } = req.body;

    // Validation
    if (!title || !abstract || !authors || !publicationYear || !studyField) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
        error: 'Validation error'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Journal file is required',
        error: 'No file uploaded'
      });
    }

    // Parse authors if it's a string
    let authorsArray = authors;
    if (typeof authors === 'string') {
      try {
        authorsArray = JSON.parse(authors);
      } catch (e) {
        authorsArray = authors.split(',').map(a => a.trim());
      }
    }

    // Create publication
    const publication = new Publication({
      title,
      abstract,
      authors: authorsArray,
      publicationYear: parseInt(publicationYear),
      studyField,
      journalFileUrl: req.file.path,
      uploader: req.user.id
    });

    await publication.save();

    // Populate uploader info
    await publication.populate('uploader', 'username email');

    res.status(201).json({
      status: 'success',
      message: 'Publication created successfully',
      data: { publication }
    });
  } catch (error) {
    console.error('Create Publication Error:', error);
    
    // Delete uploaded file if publication creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error during publication creation',
      error: error.message
    });
  }
};

// @desc    Get all publications
// @route   GET /api/publications
// @access  Public
const getAllPublications = async (req, res) => {
  try {
    const { search, studyField, year, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = {};
    
    // Search by title or abstract
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by study field
    if (studyField) {
      query.studyField = { $regex: studyField, $options: 'i' };
    }
    
    // Filter by year
    if (year) {
      query.publicationYear = parseInt(year);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get publications
    const publications = await Publication.find(query)
      .populate('uploader', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Publication.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        publications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get Publications Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching publications',
      error: error.message
    });
  }
};

// @desc    Get single publication by ID
// @route   GET /api/publications/:id
// @access  Public
const getPublicationById = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('uploader', 'username email');

    if (!publication) {
      return res.status(404).json({
        status: 'error',
        message: 'Publication not found',
        error: 'Not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { publication }
    });
  } catch (error) {
    console.error('Get Publication Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid publication ID',
        error: 'Not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching publication',
      error: error.message
    });
  }
};

// @desc    Update publication
// @route   PUT /api/publications/:id
// @access  Private
const updatePublication = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({
        status: 'error',
        message: 'Publication not found',
        error: 'Not found'
      });
    }

    // Check if user is the uploader
    if (publication.uploader.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this publication',
        error: 'Forbidden'
      });
    }

    const { title, abstract, authors, publicationYear, studyField } = req.body;

    // Update fields
    if (title) publication.title = title;
    if (abstract) publication.abstract = abstract;
    if (publicationYear) publication.publicationYear = parseInt(publicationYear);
    if (studyField) publication.studyField = studyField;
    
    if (authors) {
      let authorsArray = authors;
      if (typeof authors === 'string') {
        try {
          authorsArray = JSON.parse(authors);
        } catch (e) {
          authorsArray = authors.split(',').map(a => a.trim());
        }
      }
      publication.authors = authorsArray;
    }

    // Update file if new file uploaded
    if (req.file) {
      // Delete old file
      if (publication.journalFileUrl) {
        fs.unlink(publication.journalFileUrl, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
      publication.journalFileUrl = req.file.path;
    }

    await publication.save();
    await publication.populate('uploader', 'username email');

    res.status(200).json({
      status: 'success',
      message: 'Publication updated successfully',
      data: { publication }
    });
  } catch (error) {
    console.error('Update Publication Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error during publication update',
      error: error.message
    });
  }
};

// @desc    Delete publication
// @route   DELETE /api/publications/:id
// @access  Private
const deletePublication = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({
        status: 'error',
        message: 'Publication not found',
        error: 'Not found'
      });
    }

    // Check if user is the uploader
    if (publication.uploader.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this publication',
        error: 'Forbidden'
      });
    }

    // Delete file from filesystem
    if (publication.journalFileUrl) {
      fs.unlink(publication.journalFileUrl, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    // Delete publication from database
    await Publication.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Publication deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete Publication Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during publication deletion',
      error: error.message
    });
  }
};

module.exports = {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  deletePublication
};
