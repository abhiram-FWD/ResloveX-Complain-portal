const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const ioModule = require('./socket/io');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = ioModule.init(httpServer);

// Routes (imported after Socket.io is initialized)
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const authorityRoutes = require('./routes/authorityRoutes');

// (io initialized above)

// Socket.io handler
socketHandler(io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/authority', authorityRoutes);

// Error middleware
const errorMiddleware = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

// SLA Auto-Escalation Cron Job (runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('Running SLA check...');
  try {
    const Complaint = require('./models/Complaint');
    const overdueComplaints = await Complaint.find({
      'sla.deadline': { $lt: new Date() },
      'sla.isOverdue': false,
      status: { $nin: ['resolved', 'rejected', 'escalated'] }
    });

    for (const complaint of overdueComplaints) {
      complaint.sla.isOverdue = true;
      complaint.sla.breachedAt = new Date();
      complaint.status = 'escalated';
      complaint.timeline.push({
        action: 'escalated',
        timestamp: new Date(),
        details: 'Auto-escalated: SLA deadline exceeded',
        isVisibleToCitizen: true
      });
      await complaint.save();
      
      io.to(`complaint_${complaint.complaintId}`)
        .emit('complaint_updated', {
          complaintId: complaint.complaintId,
          status: 'escalated'
        });
    }
    console.log(`Escalated ${overdueComplaints.length} overdue complaints`);
  } catch (error) {
    console.error('SLA cron job error:', error);
  }
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
