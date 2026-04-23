require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const gigRoutes          = require('./routes/gigRoutes');
const orderRoutes        = require('./routes/orderRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const messageRoutes      = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const miscRoutes         = require('./routes/miscRoutes');
const userRoutes         = require('./routes/userRoutes');

// ─── Socket handlers ──────────────────────────────────────────────────────────
const chatHandler         = require('./sockets/chatHandler');
const notificationHandler = require('./sockets/notificationHandler');

// ─── App & HTTP server ────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  chatHandler(io, socket);
  notificationHandler(io, socket);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Security middleware ──────────────────────────────────────────────────────
// express-mongo-sanitize: replaceWith '_' to avoid NoSQL injection
// allowDots: false prevents crash on Express 5's read-only req.query getter
app.use((req, res, next) => {
  // Sanitize only mutable targets (body + params) — req.query is read-only in Express 5
  const sanitize = mongoSanitize.sanitize;
  if (req.body)   req.body   = sanitize(req.body,   { allowDots: true, replaceWith: '_' });
  if (req.params) req.params = sanitize(req.params, { allowDots: true, replaceWith: '_' });
  next();
});
app.use(hpp());                    // Prevent HTTP parameter pollution

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/gigs',          gigRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/users',         userRoutes);
app.use('/api',               miscRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'FreelancerMP API is running.' });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();
