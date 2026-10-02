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

// Fail fast rather than queueing operations for 10s while the DB is down.
// Without this, every request hangs until Mongoose's buffering timeout fires.
mongoose.set('bufferCommands', false);

/** True only when a live connection is usable. */
const isDbConnected = () => mongoose.connection.readyState === 1;

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected — database routes will return 503 until it recovers.');
});
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected.');
});

/**
 * Connect to MongoDB, retrying in the background on failure.
 *
 * This deliberately does NOT call process.exit(). Exiting takes the whole
 * service down, including /api/health, so a hosting platform reports an
 * opaque 502/503 and the actual cause — a bad MONGO_URI or an IP that is not
 * allowed through Atlas's network access list — is invisible from outside.
 * Staying up keeps the health endpoint reachable and lets the API answer with
 * a specific 503 while it keeps trying to reconnect.
 */
const connectDB = async (retryDelayMs = 5000) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('   The API stays up so /api/health remains reachable.');
    console.error('   Database-backed routes return 503 until this resolves.');
    console.error('   Common causes: a wrong MONGO_URI, or the host IP missing');
    console.error('   from Atlas > Network Access.');
    console.error(`   Retrying in ${retryDelayMs / 1000}s...`);
    setTimeout(() => connectDB(retryDelayMs), retryDelayMs).unref();
    return false;
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isDbConnected = isDbConnected;
