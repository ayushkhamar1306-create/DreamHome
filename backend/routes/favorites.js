const express = require('express');
const Favorite = require('../models/Favorite');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .populate('propertyId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to favorites
router.post('/:propertyId', protect, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if already favorited
    let favorite = await Favorite.findOne({ userId: req.user.id, propertyId });

    if (favorite) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }

    favorite = await Favorite.create({
      userId: req.user.id,
      propertyId,
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Remove from favorites
router.delete('/:propertyId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.user.id,
      propertyId: req.params.propertyId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
