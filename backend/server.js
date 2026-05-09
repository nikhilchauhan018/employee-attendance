require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// logging in dev only
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

// routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found`, data: null });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT);
}).catch(() => {
  process.exit(1);
});

module.exports = app;
