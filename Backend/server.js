const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const errorMiddleware = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
const seedCategories = require('./config/seedCategories');

// Connect to database
connectDB().then(() => {
  seedCategories();
});

// Create Express app
const app = express();

// Create HTTP server (needed for socket.io)
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Initialize socket handler
socketHandler(io);

// Export io for use in controllers
module.exports = { io };

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/authority', require('./routes/authorityRoutes'));

// Error handling middleware (must be last)
app.use(errorMiddleware);

// ─── SLA ESCALATION CRON JOB ────────────────────────
// Runs every hour to check for overdue complaints
cron.schedule('0 * * * *', async () => {
  try {
    const Complaint = require('./models/Complaint');
    const now = new Date();

    console.log(`[CRON] Running SLA escalation check at ${now.toISOString()}`);

    const overdueComplaints = await Complaint.find({
      'sla.deadline': { $lt: now },
      'sla.isOverdue': false,
      status: { $nin: ['resolved', 'rejected', 'escalated'] }
    });

    console.log(`[CRON] Found ${overdueComplaints.length} overdue complaints`);

    for (const complaint of overdueComplaints) {
      complaint.sla.isOverdue = true;
      complaint.sla.breachedAt = now;
      complaint.status = 'escalated';
      complaint.timeline.push({
        action: 'escalated',
        timestamp: now,
        details: 'Auto-escalated: SLA deadline exceeded',
        isVisibleToCitizen: true
      });

      await complaint.save();

      // Emit socket events
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: 'escalated',
        action: 'escalated',
        timestamp: now
      });

      io.to(`user_${complaint.citizen}`).emit('notification', {
        message: `Your complaint ${complaint.complaintId} has been escalated due to SLA breach`,
        type: 'warning',
        complaintId: complaint.complaintId
      });

      console.log(`[CRON] Escalated complaint: ${complaint.complaintId}`);
    }
  } catch (error) {
    console.error('[CRON] SLA escalation error:', error.message);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
