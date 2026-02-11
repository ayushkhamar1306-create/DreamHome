const express = require('express');
const router = express.Router();
const multer = require('multer');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const User = require('../models/User');
const { uploadImage } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const { 
  sendInquiryNotification, 
  sendInquiryAcceptedEmail, 
  sendInquiryDeclinedEmail 
} = require('../utils/emailService');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// @route   POST /api/inquiries
// @desc    Create a new inquiry
// @access  Private (Buyer)
router.post('/', protect, upload.single('identityProof'), async (req, res) => {
  try {
    const { propertyId, fullName, email, phone, profession } = req.body;

    // Validation
    if (!propertyId || !fullName || !email || !phone || !profession) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Identity proof document is required',
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if property is approved
    if (property.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'You can only inquire about approved properties',
      });
    }

    // Get the seller from property.user
    if (!property.user) {
      return res.status(400).json({
        success: false,
        message: 'Property owner information not found',
      });
    }

    // Fetch seller details for email
    const seller = await User.findById(property.user);
    if (!seller) {
      return res.status(400).json({
        success: false,
        message: 'Seller not found',
      });
    }

    // Check if user already has a pending inquiry for this property
    const existingInquiry = await Inquiry.findOne({
      property: propertyId,
      buyer: req.user._id,
      status: 'pending',
    });

    if (existingInquiry) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending inquiry for this property',
      });
    }

    // Upload identity proof to Cloudinary
    const identityProofUrl = await uploadImage(
      req.file.buffer,
      `inquiries/${req.user._id}`
    );

    // Create inquiry
    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: req.user._id,
      seller: property.user,
      fullName,
      email,
      phone,
      profession,
      identityProof: identityProofUrl,
    });

    // Populate inquiry data for response
    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('property', 'propertyType bhk city address price propertyImages')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    // Send email notification to seller
    try {
      // Format property price
      const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(price);
      };

      await sendInquiryNotification(seller.email, seller.name, {
        buyerName: fullName,
        buyerEmail: email,
        buyerPhone: phone,
        buyerProfession: profession,
        propertyTitle: `${property.bhk} ${property.propertyType}`,
        propertyAddress: property.address,
        propertyPrice: formatPrice(property.price),
      });

      console.log('Inquiry notification email sent to seller');
    } catch (emailError) {
      console.error('Error sending inquiry notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiry: populatedInquiry,
    });
  } catch (error) {
    console.error('Inquiry creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry',
      error: error.message,
    });
  }
});

// @route   GET /api/inquiries/buyer
// @desc    Get all inquiries by the logged-in buyer
// @access  Private (Buyer)
router.get('/buyer', protect, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ buyer: req.user._id })
      .populate('property', 'propertyType bhk city address price propertyImages status')
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error('Error fetching buyer inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message,
    });
  }
});

// @route   GET /api/inquiries/seller
// @desc    Get all inquiries for properties owned by the logged-in seller
// @access  Private (Seller)
router.get('/seller', protect, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ seller: req.user._id })
      .populate('property', 'propertyType bhk city address price propertyImages')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error('Error fetching seller inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message,
    });
  }
});

// @route   PUT /api/inquiries/:id/accept
// @desc    Accept an inquiry (Seller only)
// @access  Private (Seller)
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('property', 'propertyType bhk city address price')
      .populate('buyer', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Check if the logged-in user is the seller
    if (inquiry.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this inquiry',
      });
    }

    // Check if already processed
    if (inquiry.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Inquiry is already ${inquiry.status}`,
      });
    }

    // Update inquiry status and add seller phone
    inquiry.status = 'accepted';
    inquiry.sellerPhone = req.user.phone || 'Not provided';
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('property', 'propertyType bhk city address price propertyImages')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    // Send email notification to buyer
    try {
      await sendInquiryAcceptedEmail(inquiry.buyer.email, inquiry.buyer.name, {
        propertyTitle: `${inquiry.property.bhk} ${inquiry.property.propertyType}`,
        propertyAddress: inquiry.property.address,
        sellerName: req.user.name,
        sellerEmail: req.user.email,
        sellerPhone: req.user.phone || 'Not provided',
      });

      console.log('Inquiry accepted email sent to buyer');
    } catch (emailError) {
      console.error('Error sending inquiry accepted email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry accepted successfully',
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error('Error accepting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept inquiry',
      error: error.message,
    });
  }
});

// @route   PUT /api/inquiries/:id/decline
// @desc    Decline an inquiry (Seller only)
// @access  Private (Seller)
router.put('/:id/decline', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for declining',
      });
    }

    const inquiry = await Inquiry.findById(req.params.id)
      .populate('property', 'propertyType bhk city address price')
      .populate('buyer', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Check if the logged-in user is the seller
    if (inquiry.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to decline this inquiry',
      });
    }

    // Check if already processed
    if (inquiry.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Inquiry is already ${inquiry.status}`,
      });
    }

    // Update inquiry status
    inquiry.status = 'declined';
    inquiry.declineReason = reason;
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('property', 'propertyType bhk city address price propertyImages')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    // Send email notification to buyer
    try {
      await sendInquiryDeclinedEmail(inquiry.buyer.email, inquiry.buyer.name, {
        propertyTitle: `${inquiry.property.bhk} ${inquiry.property.propertyType}`,
        propertyAddress: inquiry.property.address,
        declineReason: reason,
      });

      console.log('Inquiry declined email sent to buyer');
    } catch (emailError) {
      console.error('Error sending inquiry declined email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry declined',
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error('Error declining inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline inquiry',
      error: error.message,
    });
  }
});

// @route   GET /api/inquiries/:id
// @desc    Get single inquiry details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('property', 'propertyType bhk city address price propertyImages')
      .populate('buyer', 'name email')
      .populate('seller', 'name email phone');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Check if user is authorized to view this inquiry
    if (
      inquiry.buyer.toString() !== req.user._id.toString() &&
      inquiry.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this inquiry',
      });
    }

    res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
      error: error.message,
    });
  }
});

module.exports = router;