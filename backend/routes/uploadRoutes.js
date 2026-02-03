const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');

// @route   GET /api/upload/signature
// @desc    Get a signature to upload directly to Cloudinary from Frontend
// @access  Public (or Private if you add middleware)
router.get('/signature', (req, res) => {
  try {
    // 1. Define the parameters for the upload
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const folder = 'finance-tracker-receipts'; // Folder name in Cloudinary

    // 2. Generate the Signature using the API Secret
    // Cloudinary requires specific params to be signed
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder,
      },
      process.env.CLOUD_API_SECRET
    );

    // 3. Send the "Permission Slip" back to Frontend
    res.json({
      timestamp,
      folder,
      signature,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.CLOUD_API_KEY
    });

  } catch (error) {
    console.error("Cloudinary Signature Error:", error);
    res.status(500).json({ message: "Could not generate upload signature" });
  }
});

module.exports = router;