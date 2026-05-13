/**
 * ============================================================================
 * Cloudinary Upload Utility — File Upload Helper
 * ============================================================================
 *
 * PURPOSE: Provides reusable functions for uploading files to Cloudinary
 *          and deleting old files from Cloudinary.
 *
 * FILE TYPES SUPPORTED:
 *   - Profile Pictures: images (jpg, png, gif, webp)
 *   - Resumes: PDF files
 *   - Cover Letters: PDF and DOCX files
 *
 * CLOUDINARY FOLDERS:
 *   - ats/profile-pictures  → Candidate profile images
 *   - ats/resumes           → Candidate resumes (PDF)
 *   - ats/cover-letters     → Candidate cover letters (PDF/DOCX)
 *
 * ★ CLOUDINARY CREDENTIALS NEEDED IN .env:
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 *
 * USAGE IN CONTROLLERS:
 *   const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
 *
 *   // Upload a file:
 *   const result = await uploadToCloudinary(file.buffer, 'ats/resumes', 'raw');
 *   // result = { url: 'https://res.cloudinary.com/...', public_id: 'ats/resumes/abc123' }
 *
 *   // Delete a file:
 *   await deleteFromCloudinary('ats/resumes/abc123', 'raw');
 *
 * ============================================================================
 */

const { cloudinary } = require('../config/cloudinary');

/**
 * Upload a file buffer to Cloudinary
 *
 * @param {Buffer} fileBuffer  - The file data (from multer)
 * @param {String} folder     - Cloudinary folder to upload to
 *                               e.g., 'ats/resumes', 'ats/profile-pictures'
 * @param {String} resourceType - 'image' for pictures, 'raw' for PDFs/DOCX
 * @returns {Object} { url, public_id } - The Cloudinary URL and public ID
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'raw') => {
  return new Promise((resolve, reject) => {
    // ★ Cloudinary upload stream — reads the buffer and uploads to cloud
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder, // e.g., 'ats/resumes'
        resource_type: resourceType, // 'image' for images, 'raw' for PDFs
        // For images, we can add transformations:
        // transformation: [{ width: 500, height: 500, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary Upload Error:', error);
          reject(new Error('File upload to Cloudinary failed'));
        } else {
          // ★ result.secure_url = HTTPS URL to the uploaded file
          // ★ result.public_id = unique ID for the file (needed for deletion)
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    // Write the file buffer to the upload stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary using its public_id
 *
 * @param {String} publicId    - The Cloudinary public_id of the file
 * @param {String} resourceType - 'image' or 'raw' (must match upload type)
 * @returns {Object} Cloudinary deletion result
 *
 * USAGE: When a candidate updates their resume, delete the old one first:
 *   if (user.resumePublicId) {
 *     await deleteFromCloudinary(user.resumePublicId, 'raw');
 *   }
 */
const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary Delete Error:', error);
    // Don't throw error — deletion failure shouldn't break the main operation
    return null;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
