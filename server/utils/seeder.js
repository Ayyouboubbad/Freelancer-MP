require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');

// ─── Seed data ────────────────────────────────────────────────────────────────
const USERS = [
  {
    name: 'Admin User',
    email: 'admin@freelancermp.com',
    password: 'Admin@1234!',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    bio: 'Platform administrator.',
    country: 'US',
  },
  {
    name: 'Alice Chen',
    email: 'alice@freelancermp.com',
    password: 'Alice@1234!',
    role: 'freelancer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    bio: 'Full-stack developer with 5+ years of experience in React and Node.js.',
    country: 'CA',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    languages: ['English', 'French'],
    xp: 320,
    level: 'pro',
    completedOrders: 12,
    totalEarnings: 4800,
    isAvailable: true,
  },
  {
    name: 'Marcus Webb',
    email: 'marcus@freelancermp.com',
    password: 'Marcus@1234!',
    role: 'freelancer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    bio: 'UI/UX designer specializing in Figma and premium web design.',
    country: 'UK',
    skills: ['Figma', 'UI/UX', 'Adobe XD', 'Branding'],
    languages: ['English'],
    xp: 680,
    level: 'expert',
    completedOrders: 27,
    totalEarnings: 13500,
    isAvailable: true,
  },
  {
    name: 'Sophia Nguyen',
    email: 'sophia@freelancermp.com',
    password: 'Sophia@1234!',
    role: 'freelancer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
    bio: 'Mobile developer building beautiful iOS and Android apps with Flutter.',
    country: 'VN',
    skills: ['Flutter', 'Dart', 'Firebase', 'iOS', 'Android'],
    languages: ['English', 'Vietnamese'],
    xp: 55,
    level: 'beginner',
    completedOrders: 3,
    totalEarnings: 720,
    isAvailable: false,
  },
  {
    name: 'James Carter',
    email: 'james@freelancermp.com',
    password: 'James@1234!',
    role: 'client',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    bio: 'Startup founder looking for top talent.',
    country: 'US',
    languages: ['English'],
  },
  {
    name: 'Leila Hassan',
    email: 'leila@freelancermp.com',
    password: 'Leila@1234!',
    role: 'client',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leila',
    bio: 'E-commerce entrepreneur.',
    country: 'AE',
    languages: ['English', 'Arabic'],
  },
];

const GIG_TEMPLATES = [
  {
    sellerIndex: 1, // Alice
    title: 'I will build a full-stack React and Node.js web application',
    description:
      'Professional full-stack development with React 18, Node.js, Express, and MongoDB. I deliver clean, documented, and production-ready code. Includes responsive design, REST API, authentication, and deployment guidance.',
    category: 'web-development',
    subcategory: 'Full-Stack',
    tags: ['react', 'nodejs', 'mongodb', 'fullstack', 'express'],
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    ],
    packages: [
      {
        name: 'basic',
        title: 'Starter',
        description: 'Simple landing page with contact form',
        price: 150,
        deliveryDays: 5,
        revisions: 2,
        features: ['Responsive design', 'Contact form', 'Basic SEO'],
      },
      {
        name: 'standard',
        title: 'Professional',
        description: 'Full web app with auth & dashboard',
        price: 450,
        deliveryDays: 10,
        revisions: 3,
        features: ['Everything in Starter', 'User authentication', 'Admin dashboard', 'MongoDB integration'],
      },
      {
        name: 'premium',
        title: 'Enterprise',
        description: 'Complete platform with real-time features',
        price: 950,
        deliveryDays: 21,
        revisions: 5,
        features: ['Everything in Professional', 'Real-time features', 'Payment integration', 'Deployment setup', 'Source code'],
      },
    ],
    faqs: [
      { question: 'What tech stack do you use?', answer: 'React 18 + Vite for frontend, Node.js + Express + MongoDB for backend.' },
      { question: 'Do you provide source code?', answer: 'Yes, full source code is provided with all packages.' },
    ],
    averageRating: 4.9,
    totalReviews: 8,
    totalOrders: 12,
    isFeatured: true,
  },
  {
    sellerIndex: 2, // Marcus
    title: 'I will design a stunning UI/UX in Figma for your web or mobile app',
    description:
      'Award-winning UI/UX designer with a portfolio of 50+ projects. I create pixel-perfect, user-centered designs that convert. Includes full Figma file with components, variants, and developer handoff.',
    category: 'design',
    subcategory: 'UI/UX Design',
    tags: ['figma', 'ui', 'ux', 'design', 'mobile', 'web'],
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
    ],
    packages: [
      {
        name: 'basic',
        title: 'Single Screen',
        description: '1 screen design in Figma',
        price: 80,
        deliveryDays: 2,
        revisions: 2,
        features: ['1 screen', 'Figma file', 'Desktop only'],
      },
      {
        name: 'standard',
        title: 'Landing Page',
        description: 'Full landing page — desktop + mobile',
        price: 250,
        deliveryDays: 5,
        revisions: 3,
        features: ['Up to 5 sections', 'Desktop + Mobile', 'Figma components', 'Style guide'],
      },
      {
        name: 'premium',
        title: 'Full App',
        description: 'Complete app UI with all screens',
        price: 700,
        deliveryDays: 14,
        revisions: 5,
        features: ['Unlimited screens', 'Design system', 'Prototype', 'Developer handoff', 'Source file'],
      },
    ],
    faqs: [
      { question: 'What software do you use?', answer: 'Figma primarily, with Adobe XD on request.' },
      { question: 'Will I get the Figma source file?', answer: 'Yes, always. Standard and Premium include full file access.' },
    ],
    averageRating: 5.0,
    totalReviews: 14,
    totalOrders: 27,
    isFeatured: true,
  },
  {
    sellerIndex: 3, // Sophia
    title: 'I will develop a cross-platform Flutter mobile app',
    description:
      'Flutter expert building high-performance iOS and Android applications. Clean architecture, state management with Riverpod, and Firebase integration. Deliverables include full source code and APK/IPA file.',
    category: 'mobile-apps',
    subcategory: 'Flutter',
    tags: ['flutter', 'dart', 'ios', 'android', 'firebase', 'mobile'],
    images: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
    ],
    packages: [
      {
        name: 'basic',
        title: 'Simple App',
        description: 'Basic app with 3–5 screens',
        price: 300,
        deliveryDays: 7,
        revisions: 2,
        features: ['3-5 screens', 'Android + iOS', 'Basic navigation'],
      },
      {
        name: 'standard',
        title: 'Feature-Rich App',
        description: 'Full-featured app with API + Firebase',
        price: 700,
        deliveryDays: 14,
        revisions: 3,
        features: ['Everything in Simple', 'Firebase auth', 'REST API integration', 'Push notifications'],
      },
      {
        name: 'premium',
        title: 'Enterprise App',
        description: 'Complete production-ready app',
        price: 1500,
        deliveryDays: 30,
        revisions: 5,
        features: ['Everything in Feature-Rich', 'Payments', 'Admin panel', 'Play Store + App Store submission'],
      },
    ],
    faqs: [
      { question: 'Do you publish to stores?', answer: 'Yes, the Premium package includes store submission.' },
    ],
    averageRating: 4.7,
    totalReviews: 3,
    totalOrders: 3,
    isFeatured: false,
  },
  {
    sellerIndex: 1, // Alice — second gig
    title: 'I will build a REST API with Node.js, Express, and MongoDB',
    description:
      'Professional backend API development with Node.js, Express, MongoDB, and JWT authentication. Follows RESTful best practices, includes Swagger docs, input validation, and rate limiting.',
    category: 'web-development',
    subcategory: 'Backend',
    tags: ['nodejs', 'api', 'express', 'mongodb', 'backend', 'rest'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    ],
    packages: [
      {
        name: 'basic',
        title: 'Simple API',
        description: '5 endpoints with basic auth',
        price: 120,
        deliveryDays: 3,
        revisions: 2,
        features: ['5 endpoints', 'JWT auth', 'MongoDB'],
      },
      {
        name: 'standard',
        title: 'Full API',
        description: 'Complete REST API with roles',
        price: 320,
        deliveryDays: 7,
        revisions: 3,
        features: ['Unlimited endpoints', 'RBAC', 'Validation', 'Error handling', 'Swagger docs'],
      },
      {
        name: 'premium',
        title: 'Production API',
        description: 'Enterprise-grade API with real-time',
        price: 650,
        deliveryDays: 14,
        revisions: 5,
        features: ['Everything in Full', 'Socket.io', 'Rate limiting', 'Cloudinary uploads', 'Docker setup'],
      },
    ],
    faqs: [
      { question: 'Do you provide Postman collection?', answer: 'Yes, every delivery includes a Postman collection.' },
    ],
    averageRating: 4.8,
    totalReviews: 4,
    totalOrders: 6,
    isFeatured: false,
  },
];

// ─── Seeder functions ─────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await connectDB();
    console.log('🗑  Clearing existing data...');

    await Promise.all([
      User.deleteMany(),
      Gig.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      Conversation.deleteMany(),
      Message.deleteMany(),
      Notification.deleteMany(),
      Transaction.deleteMany(),
      ActivityLog.deleteMany(),
    ]);

    console.log('👤 Seeding users...');
    const users = await Promise.all(
      USERS.map(async (u) => {
        const hashed = await bcrypt.hash(u.password, 12);
        return { ...u, password: hashed };
      })
    );
    const createdUsers = await User.insertMany(users);
    console.log(`   ✓ ${createdUsers.length} users created`);

    // Build user map: index → _id
    const userIds = createdUsers.map((u) => u._id);

    console.log('📦 Seeding gigs...');
    const gigsData = GIG_TEMPLATES.map((g) => ({
      ...g,
      seller: userIds[g.sellerIndex],
    }));
    const createdGigs = await Gig.insertMany(gigsData);
    console.log(`   ✓ ${createdGigs.length} gigs created`);

    // ─── Create one completed order + review per featured gig ────────────────
    console.log('🛒 Seeding orders & reviews...');
    const clientId  = userIds[4]; // James
    const clientId2 = userIds[5]; // Leila

    const ordersData = [
      {
        client: clientId,
        freelancer: userIds[1],   // Alice
        gig: createdGigs[0]._id,
        package: createdGigs[0].packages[1],
        price: 450,
        platformFee: 90,
        freelancerEarnings: 360,
        status: 'completed',
        paymentStatus: 'paid',
        deadline: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        deliveredAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
        requirements: 'Build a dashboard for my SaaS app.',
      },
      {
        client: clientId2,
        freelancer: userIds[2],   // Marcus
        gig: createdGigs[1]._id,
        package: createdGigs[1].packages[2],
        price: 700,
        platformFee: 140,
        freelancerEarnings: 560,
        status: 'completed',
        paymentStatus: 'paid',
        deadline: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        deliveredAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        requirements: 'Full redesign of my e-commerce app.',
      },
      {
        client: clientId,
        freelancer: userIds[1],   // Alice
        gig: createdGigs[3]._id,
        package: createdGigs[3].packages[1],
        price: 320,
        platformFee: 64,
        freelancerEarnings: 256,
        status: 'active',
        paymentStatus: 'paid',
        deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        requirements: 'REST API for my marketplace.',
      },
    ];

    const createdOrders = await Order.insertMany(ordersData);
    console.log(`   ✓ ${createdOrders.length} orders created`);

    // Reviews for the 2 completed orders
    const reviewsData = [
      {
        order: createdOrders[0]._id,
        gig: createdGigs[0]._id,
        reviewer: clientId,
        reviewee: userIds[1],
        rating: 5,
        comment: 'Absolutely outstanding work! Alice delivered a pixel-perfect React dashboard ahead of schedule. Communication was excellent throughout. Highly recommend!',
      },
      {
        order: createdOrders[1]._id,
        gig: createdGigs[1]._id,
        reviewer: clientId2,
        reviewee: userIds[2],
        rating: 5,
        comment: 'Marcus is a true design wizard. The UI he created for our app is stunning and our conversion rates improved by 40%. Will definitely hire again!',
      },
    ];

    await Review.insertMany(reviewsData);
    console.log(`   ✓ ${reviewsData.length} reviews created`);

    // Transactions
    const txData = createdOrders.slice(0, 2).map((o, i) => ({
      order: o._id,
      payer: o.client,
      payee: o.freelancer,
      amount: o.price,
      platformFee: o.platformFee,
      netAmount: o.freelancerEarnings,
      status: 'completed',
    }));
    await Transaction.insertMany(txData);
    console.log(`   ✓ ${txData.length} transactions created`);

    // ─── Conversation + messages between James and Alice ──────────────────────
    console.log('💬 Seeding conversations...');
    const conversation = await Conversation.create({
      participants: [clientId, userIds[1]],
      lastMessageAt: new Date(),
    });

    const msgs = [
      { conversation: conversation._id, sender: clientId,  text: 'Hi Alice! I just placed my order. Excited to work with you!' },
      { conversation: conversation._id, sender: userIds[1], text: 'Hi James! Thanks so much. I have reviewed your requirements and will start right away. Feel free to ask any questions!' },
      { conversation: conversation._id, sender: clientId,  text: 'Great, looking forward to it. The deadline works perfectly.' },
    ];
    const createdMessages = await Message.insertMany(msgs);
    conversation.lastMessage = createdMessages[createdMessages.length - 1]._id;
    await conversation.save();
    console.log(`   ✓ 1 conversation with ${msgs.length} messages created`);

    // Welcome notifications
    console.log('🔔 Seeding notifications...');
    const notifData = createdUsers.map((u) => ({
      user: u._id,
      type: 'system',
      title: 'Welcome to FreelancerMP! 🎉',
      body: `Hi ${u.name}, your account has been seeded. Explore the platform!`,
      link: '/',
    }));
    await Notification.insertMany(notifData);
    console.log(`   ✓ ${notifData.length} notifications created`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('Test credentials:');
    USERS.forEach((u) => {
      console.log(`  ${u.role.padEnd(12)} ${u.email.padEnd(30)} ${u.password}`);
    });
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany(),
      Gig.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      Conversation.deleteMany(),
      Message.deleteMany(),
      Notification.deleteMany(),
      Transaction.deleteMany(),
      ActivityLog.deleteMany(),
    ]);
    console.log('🗑  All data destroyed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Destroy error:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
