/**
 * ============================================================================
 * Seed Data — Initial Database Population Script
 * ============================================================================
 *
 * PURPOSE: Populates the MongoDB Atlas database with initial sample data
 *          for branches and an admin user so you can test the application.
 *
 * HOW TO RUN:
 *   1. Make sure your .env file is set up with MONGO_URI
 *   2. Run: node seed.js
 *
 * WHAT IT CREATES:
 *   - 4 Branches: Islamabad, Lahore, Karachi, Remote
 *   - 1 Admin user: admin@ats.com / admin123
 *   - 5 Sample Jobs across different branches and departments
 *
 * ★ MONGO_URI must be set in .env before running this script
 *
 * ============================================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Job, Branch, Application } = require('./models');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    // ── Connect to MongoDB Atlas ──────────────────────────────────────────
    await connectDB();

    // ── Clear existing data ───────────────────────────────────────────────
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    console.log('🗑️  Cleared existing data...');

    // ═══════════════════════════════════════════════════════════════════════
    // 1. CREATE BRANCHES
    // ═══════════════════════════════════════════════════════════════════════
    const branches = await Branch.insertMany([
      {
        name: 'Islamabad',
        location: 'Blue Area, Jinnah Avenue, Islamabad',
        city: 'Islamabad',
        contactPhone: '+92-51-1234567',
        contactEmail: 'islamabad@atscompany.com',
        isRemote: false,
      },
      {
        name: 'Lahore',
        location: 'Johar Town, Lahore',
        city: 'Lahore',
        contactPhone: '+92-42-1234567',
        contactEmail: 'lahore@atscompany.com',
        isRemote: false,
      },
      {
        name: 'Karachi',
        location: 'Clifton, Karachi',
        city: 'Karachi',
        contactPhone: '+92-21-1234567',
        contactEmail: 'karachi@atscompany.com',
        isRemote: false,
      },
      {
        name: 'Remote',
        location: 'Work from Anywhere',
        city: 'Remote',
        contactPhone: '',
        contactEmail: 'remote@atscompany.com',
        isRemote: true,
      },
    ]);

    console.log('✅ Created 4 branches');

    // ═══════════════════════════════════════════════════════════════════════
    // 2. CREATE ADMIN USER
    // ═══════════════════════════════════════════════════════════════════════
    const admin = await User.create({
      name: 'ATS Admin',
      email: 'admin@ats.com',
      password: 'admin123', // Will be hashed automatically by the model
      role: 'admin',
      phone: '+92-300-0000000',
    });

    console.log('✅ Created admin user: admin@ats.com / admin123');

    // ═══════════════════════════════════════════════════════════════════════
    // 3. CREATE SAMPLE CANDIDATES
    // ═══════════════════════════════════════════════════════════════════════
    const candidates = await User.insertMany([
      {
        name: 'Ali Khan',
        email: 'ali@example.com',
        password: 'candidate123',
        role: 'candidate',
        phone: '+92-301-1111111',
        skills: ['React', 'JavaScript', 'CSS'],
        experience: '2 years',
        education: 'BS Computer Science',
      },
      {
        name: 'Sara Ahmed',
        email: 'sara@example.com',
        password: 'candidate123',
        role: 'candidate',
        phone: '+92-302-2222222',
        skills: ['Node.js', 'Express', 'MongoDB'],
        experience: '3 years',
        education: 'BS Software Engineering',
      },
    ]);

    console.log('✅ Created 2 sample candidates');

    // ═══════════════════════════════════════════════════════════════════════
    // 4. CREATE SAMPLE JOBS
    // ═══════════════════════════════════════════════════════════════════════
    const jobs = await Job.insertMany([
      {
        title: 'React Developer',
        description: 'We are looking for a skilled React Developer to join our Islamabad team. You will be responsible for building modern web applications using React.js, collaborating with backend developers, and ensuring high performance and responsiveness of applications.',
        department: 'Engineering',
        branch: branches[0]._id, // Islamabad
        employmentType: 'Full-time',
        experienceLevel: 'Mid Level',
        salaryMin: 80000,
        salaryMax: 150000,
        availableSeats: 3,
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'REST API'],
        deadline: new Date('2026-08-31'),
        status: 'Open',
        createdBy: admin._id,
      },
      {
        title: 'UI/UX Designer',
        description: 'Join our Lahore office as a UI/UX Designer. You will create intuitive and visually appealing user interfaces for our digital products, conduct user research, and collaborate with the development team to implement designs.',
        department: 'Design',
        branch: branches[1]._id, // Lahore
        employmentType: 'Full-time',
        experienceLevel: 'Entry Level',
        salaryMin: 60000,
        salaryMax: 120000,
        availableSeats: 2,
        skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
        deadline: new Date('2026-07-31'),
        status: 'Open',
        createdBy: admin._id,
      },
      {
        title: 'Backend Developer (Node.js)',
        description: 'We are hiring a Backend Developer for our Karachi office. You will design and implement server-side logic, build RESTful APIs, and manage database operations using Node.js and MongoDB.',
        department: 'Engineering',
        branch: branches[2]._id, // Karachi
        employmentType: 'Full-time',
        experienceLevel: 'Senior Level',
        salaryMin: 120000,
        salaryMax: 200000,
        availableSeats: 2,
        skills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JWT'],
        deadline: new Date('2026-09-15'),
        status: 'Open',
        createdBy: admin._id,
      },
      {
        title: 'DevOps Engineer',
        description: 'Work remotely as a DevOps Engineer. You will manage CI/CD pipelines, containerize applications using Docker, manage cloud infrastructure on AWS, and ensure system reliability and scalability.',
        department: 'Engineering',
        branch: branches[3]._id, // Remote
        employmentType: 'Remote',
        experienceLevel: 'Mid Level',
        salaryMin: 100000,
        salaryMax: 180000,
        availableSeats: 1,
        skills: ['Docker', 'AWS', 'CI/CD', 'Linux', 'Kubernetes'],
        deadline: new Date('2026-10-01'),
        status: 'Open',
        createdBy: admin._id,
      },
      {
        title: 'Marketing Intern',
        description: 'Join our Islamabad office as a Marketing Intern. This is a great opportunity for fresh graduates to gain hands-on experience in digital marketing, social media management, and content creation.',
        department: 'Marketing',
        branch: branches[0]._id, // Islamabad
        employmentType: 'Internship',
        experienceLevel: 'Entry Level',
        salaryMin: 20000,
        salaryMax: 35000,
        availableSeats: 5,
        skills: ['Social Media', 'Content Writing', 'SEO'],
        deadline: new Date('2026-06-30'),
        status: 'Open',
        createdBy: admin._id,
      },
    ]);

    console.log('✅ Created 5 sample jobs');

    // ═══════════════════════════════════════════════════════════════════════
    // DONE!
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🎉 Seed data inserted successfully!');
    console.log('───────────────────────────────────────');
    console.log('Admin Login: admin@ats.com / admin123');
    console.log('Candidate Login: ali@example.com / candidate123');
    console.log('Candidate Login: sara@example.com / candidate123');
    console.log('───────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedData();
