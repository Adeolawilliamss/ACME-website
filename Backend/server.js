const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 shutting down....');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const http = require('http');
const { Server } = require('socket.io');

// Create HTTP server from express app
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://acme-website-bice.vercel.app'],
    credentials: true,
  },
});

// Setup socket.io logic
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // Join a private room based on user ID (admin, customer, etc.)
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Listen for messages and emit to the room
  socket.on('sendMessage', ({ roomId, message, sender }) => {
    console.log(`Message from ${sender} in ${roomId}: ${message}`);
    io.to(roomId).emit('receiveMessage', { sender, message });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Database connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.set('bufferTimeoutMS', 30000);

mongoose
  .connect(DB, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('✅ DB Connection successful!'))
  .catch((err) => {
    console.error('❌ DB Connection error:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || '3000';
server.listen(port, () => {
  console.log(`App + WebSocket server running on port ${port}...`);
});

console.log('Environment:', process.env.NODE_ENV);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 shutting down....');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋SIGTERM RECEIVED,Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
