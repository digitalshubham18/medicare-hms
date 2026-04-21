// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST']
//   }
// });

// // Make io accessible in routes
// app.set('io', io);

// // Security middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);

// // CORS
// // app.use(cors({
// //   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// //   credentials: true
// // }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));

// app.options('*', cors());
// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Static files (uploads)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/medicines', require('./routes/medicines'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/records', require('./routes/records'));
// app.use('/api/reminders', require('./routes/reminders'));
// app.use('/api/alerts', require('./routes/alerts'));
// app.use('/api/analytics', require('./routes/analytics'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'MediCare HMS API running', timestamp: new Date() });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || 'Internal Server Error'
//   });
// });

// // Socket.io events
// io.on('connection', (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`Socket ${socket.id} joined room: ${room}`);
//   });

//   socket.on('sos_trigger', (data) => {
//     io.emit('sos_alert', { ...data, timestamp: new Date() });
//   });

//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     server.listen(process.env.PORT || 5000, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
//       console.log(`🏥 MediCare HMS API: http://localhost:${process.env.PORT || 5000}`);
//     });
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection error:', err.message);
//     process.exit(1);
//   });

// // Cron jobs for reminders
// require('./utils/cronJob')(io);

// module.exports = { app, io };


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST']
//   }
// });

// // Make io accessible in routes
// app.set('io', io);

// // Security middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);

// // CORS
// // app.use(cors({
// //   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// //   credentials: true
// // }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));

// app.options('*', cors());
// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Static files (uploads)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/medicines', require('./routes/medicines'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/records', require('./routes/records'));
// app.use('/api/reminders', require('./routes/reminders'));
// app.use('/api/alerts', require('./routes/alerts'));
// app.use('/api/analytics', require('./routes/analytics'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'MediCare HMS API running', timestamp: new Date() });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || 'Internal Server Error'
//   });
// });

// // Socket.io events
// io.on('connection', (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`Socket ${socket.id} joined room: ${room}`);
//   });

//   socket.on('sos_trigger', (data) => {
//     io.emit('sos_alert', { ...data, timestamp: new Date() });
//   });

//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     server.listen(process.env.PORT || 5000, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
//       console.log(`🏥 MediCare HMS API: http://localhost:${process.env.PORT || 5000}`);
//     });
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection error:', err.message);
//     process.exit(1);
//   });

// // Cron jobs for reminders
// require('./utils/cronJob')(io);

// module.exports = { app, io };


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST']
//   }
// });

// // Make io accessible in routes
// app.set('io', io);

// // Security middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);

// // CORS
// // app.use(cors({
// //   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// //   credentials: true
// // }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));

// app.options('*', cors());
// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Static files (uploads)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/medicines', require('./routes/medicines'));
// app.use('/api/facility', require('./routes/facility'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/records', require('./routes/records'));
// app.use('/api/reminders', require('./routes/reminders'));
// app.use('/api/alerts', require('./routes/alerts'));
// app.use('/api/analytics', require('./routes/analytics'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'MediCare HMS API running', timestamp: new Date() });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || 'Internal Server Error'
//   });
// });

// // Socket.io events
// io.on('connection', (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   // Chat room joining
//   socket.on('join_chat_room', (room) => {
//     socket.join(room);
//   });
//   socket.on('leave_chat_room', (room) => {
//     socket.leave(room);
//   });
//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`Socket ${socket.id} joined room: ${room}`);
//   });

//   socket.on('sos_trigger', (data) => {
//     io.emit('sos_alert', { ...data, timestamp: new Date() });
//   });

//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     server.listen(process.env.PORT || 5000, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
//       console.log(`🏥 MediCare HMS API: http://localhost:${process.env.PORT || 5000}`);
//     });
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection error:', err.message);
//     process.exit(1);
//   });

// // Cron jobs for reminders
// require('./utils/cronJob')(io);

// module.exports = { app, io };


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST']
//   }
// });

// // Make io accessible in routes
// app.set('io', io);

// // Security middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);

// // CORS
// // app.use(cors({
// //   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// //   credentials: true
// // }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));

// app.options('*', cors());
// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Static files (uploads)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/medicines', require('./routes/medicines'));
// app.use('/api/leavetasks', require('./routes/leaveTasks'));
// app.use('/api/facility', require('./routes/facility'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/records', require('./routes/records'));
// app.use('/api/reminders', require('./routes/reminders'));
// app.use('/api/alerts', require('./routes/alerts'));
// app.use('/api/analytics', require('./routes/analytics'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'MediCare HMS API running', timestamp: new Date() });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || 'Internal Server Error'
//   });
// });

// // Socket.io events
// io.on('connection', (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   // Chat room joining
//   socket.on('join_chat_room', (room) => {
//     socket.join(room);
//   });
//   socket.on('leave_chat_room', (room) => {
//     socket.leave(room);
//   });
//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`Socket ${socket.id} joined room: ${room}`);
//   });

//   socket.on('sos_trigger', (data) => {
//     io.emit('sos_alert', { ...data, timestamp: new Date() });
//   });

//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     server.listen(process.env.PORT || 5000, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
//       console.log(`🏥 MediCare HMS API: http://localhost:${process.env.PORT || 5000}`);
//     });
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection error:', err.message);
//     process.exit(1);
//   });

// // Cron jobs for reminders
// require('./utils/cronJob')(io);

// module.exports = { app, io };

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST']
//   }
// });

// // Make io accessible in routes
// app.set('io', io);

// // Security middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);

// // CORS
// // app.use(cors({
// //   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// //   credentials: true
// // }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));

// app.options('*', cors());
// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Static files (uploads)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/medicines', require('./routes/medicines'));
// app.use('/api/leavetasks', require('./routes/leaveTasks'));
// app.use('/api/facility', require('./routes/facility'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/records', require('./routes/records'));
// app.use('/api/reminders', require('./routes/reminders'));
// app.use('/api/alerts', require('./routes/alerts'));
// app.use('/api/analytics', require('./routes/analytics'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'MediCare HMS API running', timestamp: new Date() });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || 'Internal Server Error'
//   });
// });

// // Socket.io events
// io.on('connection', (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   // Chat room joining
//   socket.on('join_chat_room', (room) => {
//     socket.join(room);
//   });
//   socket.on('leave_chat_room', (room) => {
//     socket.leave(room);
//   });
//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`Socket ${socket.id} joined room: ${room}`);
//   });

//   socket.on('sos_trigger', (data) => {
//     io.emit('sos_alert', { ...data, timestamp: new Date() });
//   });

//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     server.listen(process.env.PORT || 5000, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
//       console.log(`🏥 MediCare HMS API: http://localhost:${process.env.PORT || 5000}`);
//     });
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection error:', err.message);
//     process.exit(1);
//   });

// // Cron jobs for reminders
// require('./utils/cronJob')(io);

// module.exports = { app, io };



const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// CORS
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(cors({
//   origin: "*",
//   // credentials: true
// }));
// app.use(cors({
//   origin: true,
//   credentials: true
// }));

app.options('*', cors());
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/salary', require('./routes/salary'));
app.use('/api/leavetasks', require('./routes/leaveTasks'));
app.use('/api/facility', require('./routes/facility'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/records', require('./routes/records'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/analytics', require('./routes/analytics'));
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MediCare HMS API running', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Chat room joining
  // Join personal notification room
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('join_chat_room', (room) => {
    socket.join(room);
  });
  socket.on('leave_chat_room', (room) => {
    socket.leave(room);
  });
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('sos_trigger', (data) => {
    io.emit('sos_alert', { ...data, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // server.listen(process.env.PORT || 5000, () => {
    //   console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    //   // console.log(`🏥 MediCare HMS API: http://localhost:${process.env.PORT || 5000}`);
    //   console.log(`🏥 MediCare HMS API running`);
    // });
    const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 MediCare HMS API running`);
});
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
  server.on('error', (err) => {
  console.error('Server error:', err);
});

// Cron jobs for reminders
require('./utils/cronJob')(io);

module.exports = { app, io };