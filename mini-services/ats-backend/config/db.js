/**
 * ============================================================================
 * Database Configuration — MongoDB Atlas Connection
 * ============================================================================
 *
 * ★★★ IMPORTANT — MONGODB ATLAS SETUP (DO THIS FIRST) ★★★
 *
 * Step-by-step MongoDB Atlas setup:
 *
 * 1. Go to https://www.mongodb.com/cloud/atlas and create a free account
 * 2. Create a new cluster (Free M0 tier is sufficient for this project)
 * 3. Under "Database Access", create a user with readWrite permissions
 *    - Remember the username and password you set!
 * 4. Under "Network Access", click "Add IP Address" → enter 0.0.0.0/0
 *    - This allows connections from ANY server (needed for Render deployment)
 * 5. Click "Connect" on your cluster → "Connect your application"
 * 6. Copy the connection string — it looks like:
 *    mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
 * 7. Replace <username> and <password> with your actual credentials
 * 8. Add the full string to your .env file as MONGO_URI
 *
 * ★ SECURITY: NEVER commit your .env file to GitHub!
 *   Add .env to your .gitignore file
 *
 * ============================================================================
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * This function is called once in server.js when the app starts
 */
const connectDB = async () => {
  try {
    // ★ MONGO_URI comes from the .env file
    // Example: mongodb+srv://atsuser:mypassword@cluster0.abcde.mongodb.net/ats_db
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are recommended for MongoDB Atlas connections
      // (mongoose 6+ has these as defaults, but it's good to be explicit)
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error:', error.message);
    // Exit the process with failure — can't run the app without DB
    process.exit(1);
  }
};

module.exports = connectDB;
