/**
 * ============================================================================
 * Cloudinary Configuration — File Upload Service
 * ============================================================================
 *
 * ★★★ IMPORTANT — CLOUDINARY SETUP (DO THIS SECOND) ★★★
 *
 * Step-by-step Cloudinary setup:
 *
 * 1. Go to https://cloudinary.com and create a free account
 * 2. After signing in, go to your Dashboard (top-right → Dashboard)
 * 3. You will see these three values — COPY THEM:
 *    - Cloud Name        → goes in .env as CLOUDINARY_CLOUD_NAME
 *    - API Key           → goes in .env as CLOUDINARY_API_KEY
 *    - API Secret        → goes in .env as CLOUDINARY_API_SECRET
 * 4. NEVER share or commit these values — they go in .env only!
 *
 * WHAT CLOUDINARY DOES IN THIS PROJECT:
 *   - Stores candidate profile pictures (images)
 *   - Stores candidate resumes (PDF files)
 *   - Stores candidate cover letters (PDF/DOCX files)
 *   - Returns a URL for each uploaded file → we save that URL in MongoDB
 *
 * WHY NOT STORE FILES LOCALLY?
 *   - Local storage doesn't work on cloud deployments (Render, Vercel)
 *   - Cloudinary provides CDN-backed URLs (fast access worldwide)
 *   - Automatic image optimization and transformation
 *   - Free tier: 25 GB storage + 25 GB bandwidth/month
 *
 * ============================================================================
 */

const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary with credentials from .env
 * This must be called before any upload operations
 */
const configureCloudinary = () => {
  cloudinary.config({
    // ★ CLOUDINARY CREDENTIALS — Get these from your Cloudinary Dashboard
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,    // e.g., "mycompany123"
    api_key: process.env.CLOUDINARY_API_KEY,           // e.g., "123456789012345"
    api_secret: process.env.CLOUDINARY_API_SECRET,     // e.g., "abcdefgHIJKLmnop"
    secure: true, // Always use HTTPS for URLs
  });

  console.log('✅ Cloudinary Configured');
};

module.exports = { cloudinary, configureCloudinary };
