const { createCanvas, loadImage, registerFont } = require('canvas');
const { uploadImage } = require('../config/cloudinary');

/**
 * Generates a receipt as PNG image and uploads to Cloudinary
 * @param {Object} property - MongoDB property document
 * @returns {Promise<string>} Cloudinary secure_url (image)
 */
const generateReceipt = async (property) => {
  try {
    // Canvas size (A4-ish portrait, high-res for clarity)
    const width = 800;
    const height = 1130; // ~A4 ratio
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Fonts (use system fonts or load custom if needed)
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#0369a1';
    ctx.textAlign = 'center';
    ctx.fillText('PROPERTY LISTING RECEIPT', width / 2, 80);

    // Receipt ID & Date
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'right';
    ctx.fillText(`Receipt ID: ${property._id.toString()}`, width - 40, 120);
    ctx.fillText(`Date: ${new Date(property.createdAt).toLocaleDateString('en-IN')}`, width - 40, 145);

    let y = 200;

    // Owner Information
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#0369a1';
    ctx.textAlign = 'left';
    ctx.fillText('Owner Information', 40, y);
    y += 35;

    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`Name:  ${property.ownerName || 'N/A'}`, 40, y); y += 25;
    ctx.fillText(`Email: ${property.ownerEmail || 'N/A'}`, 40, y); y += 25;
    ctx.fillText(`Phone: ${property.ownerPhone || 'N/A'}`, 40, y); y += 50;

    // Property Details
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#0369a1';
    ctx.fillText('Property Details', 40, y); y += 35;

    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    const propLines = [
      `Type:        ${property.propertyType ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 'N/A'}`,
      `BHK:         ${property.bhk || 'N/A'}`,
      `Area:        ${property.sqft || 'N/A'} sq.ft.`,
      `City:        ${property.city || 'N/A'}`,
      `Address:     ${property.address || 'N/A'}`,
      `Listed For:  ${property.propertyFor ? property.propertyFor.charAt(0).toUpperCase() + property.propertyFor.slice(1) : 'N/A'}`,
      `Price:       ₹${Number(property.price || 0).toLocaleString('en-IN')}`,
    ];

    propLines.forEach(line => {
      ctx.fillText(line, 40, y);
      y += 25;
    });
    y += 40;

    // Payment Details
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#0369a1';
    ctx.fillText('Payment Details', 40, y); y += 35;

    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`Listing Charges:  ₹${Number(property.charges || 0).toLocaleString('en-IN')}`, 40, y); y += 25;
    ctx.fillText(`Payment Method:   ${property.paymentMethod || 'N/A'}`, 40, y); y += 50;

    // Total Box
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(30, y - 10, width - 60, 70);
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, y - 10, width - 60, 70);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`Total Amount Paid:  ₹${Number(property.charges || 0).toLocaleString('en-IN')}`, 50, y + 35);

    y += 100;

    // Footer
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('This is a computer-generated receipt and does not require a signature.', width / 2, y);
    y += 20;
    ctx.fillText('For queries, please contact support@propertylisting.com', width / 2, y);

    // Border around page
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Get buffer (PNG by default - high quality)
    const buffer = canvas.toBuffer('image/png');

    // Upload as image (folder 'receipts', resource_type 'image' is default)
    const cloudinaryUrl = await uploadImage(buffer, 'receipts');

    return cloudinaryUrl;
  } catch (error) {
    console.error('Error generating receipt image:', error);
    throw new Error(`Receipt generation failed: ${error.message}`);
  }
};

module.exports = { generateReceipt };