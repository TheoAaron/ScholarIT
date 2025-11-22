const express = require('express');
const router = express.Router();
const {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  deletePublication
} = require('../controllers/publicationController');
const { verifyToken } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');

// Public routes
router.get('/', getAllPublications);
router.get('/:id', getPublicationById);

// Private routes - upload file first, then verify token in the file upload callback
router.post('/', (req, res, next) => {
  uploadFile(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload error',
        error: err.message
      });
    }
    next();
  });
}, verifyToken, createPublication);

router.put('/:id', (req, res, next) => {
  uploadFile(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload error',
        error: err.message
      });
    }
    next();
  });
}, verifyToken, updatePublication);

router.delete('/:id', verifyToken, deletePublication);

module.exports = router;
