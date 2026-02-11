const express = require('express');
const router = express.Router();
const {
  adminLogin,
  verifyAdmin,
  getStatistics,
  getProperties,
  updatePropertyStatus,
  getUsers,
  getInquiries,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/adminAuth');

// Public routes
router.post('/login', adminLogin);

// Protected routes (require authentication and admin role)
router.use(protect); // Apply protect middleware to all routes below
router.use(adminOnly); // Apply adminOnly middleware to all routes below

router.get('/verify', verifyAdmin);
router.get('/statistics', getStatistics);
router.get('/properties', getProperties);
router.put('/properties/:id', updatePropertyStatus);
router.get('/users', getUsers);
router.get('/inquiries', getInquiries);

module.exports = router;