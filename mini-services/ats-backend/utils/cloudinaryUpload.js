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

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// ---------------------------------------------------------------------------
// Local-disk fallback
// ---------------------------------------------------------------------------
// When Cloudinary credentials are absent the app still needs somewhere to put
// resumes and profile pictures, otherwise every upload 500s. Files go to
// ./uploads, which index.js serves statically at /uploads.
//
// This is for local development. On an ephemeral host (Render, Vercel) the
// disk is wiped on every restart, so set the Cloudinary vars in production.

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

// Public base URL of this API, used to build absolute file URLs.
const publicBaseUrl = () =>
  (process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`)
    .replace(/\/+$/, '');

const saveToLocalDisk = async (fileBuffer, folder, originalName) => {
  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.promises.mkdir(dir, { recursive: true });

  // Keep the real extension so browsers render PDFs and images correctly.
  const ext = path.extname(originalName || '') || '';
  const id = crypto.randomBytes(16).toString('hex');
  const fileName = `${id}${ext}`;

  await fs.promises.writeFile(path.join(dir, fileName), fileBuffer);

  const relativePath = `${folder}/${fileName}`;
  return {
    url: `${publicBaseUrl()}/uploads/${relativePath}`,
    // The 'local:' prefix tells deleteFromCloudinary which backend owns it.
    public_id: `local:${relativePath}`,
  };
};

const deleteFromLocalDisk = async (publicId) => {
  const relativePath = publicId.slice('local:'.length);
  const target = path.join(UPLOAD_ROOT, relativePath);

  // Guard against a stored id escaping the uploads directory.
  if (!path.resolve(target).startsWith(path.resolve(UPLOAD_ROOT))) return null;

  try {
    await fs.promises.unlink(target);
    console.log(`✅ Deleted local upload: ${relativePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Local delete error:', error);
  }
  return null;
};

/**
 * Upload a file buffer to Cloudinary
 *
 * @param {Buffer} fileBuffer  - The file data (from multer)
 * @param {String} folder     - Cloudinary folder to upload to
 *                               e.g., 'ats/resumes', 'ats/profile-pictures'
 * @param {String} resourceType - 'image' for pictures, 'raw' for PDFs/DOCX
 * @returns {Object} { url, public_id } - The Cloudinary URL and public ID
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'raw', originalName = '') => {
  if (!isCloudinaryConfigured()) {
    return saveToLocalDisk(fileBuffer, folder, originalName);
  }

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

    if (publicId.startsWith('local:')) return deleteFromLocalDisk(publicId);

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
