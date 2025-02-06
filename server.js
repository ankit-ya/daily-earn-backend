require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/auth');
const earningsRoutes = require('./routes/earningsRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const convertRoutes = require('./routes/convertRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuth = require('./routes/adminAuth');
const feedbackRoutes = require('./routes/feedbackRoutes');
const withdrawals = require('./routes/withdrawals');

const app = express();

// ✅ Enable CORS for the frontend domain only
app.use(cors({
    origin: "https://daily-earn-s7mh.vercel.app",
    credentials: true,
}));

app.use(express.json());

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "https://daily-earn-s7mh.vercel.app",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Middleware to use io in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// MongoDB connection (use process.env for production)
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Register routes
app.use('/api/tasks', taskRoutes);
app.use('/api', authRoutes);
app.use('/api', earningsRoutes);
app.use('/api', convertRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', notificationRoutes);
app.use('/api', adminRoutes);
app.use('/api/admin', adminAuth);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/withdrawals', withdrawals);

// Simple route
app.get('/', (req, res) => {
    res.send('Welcome to Daily Earn Backend');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
