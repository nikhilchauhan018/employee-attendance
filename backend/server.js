require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const frontendDistPath = path.join(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : true;

app.use(cors({
  origin: corsOrigins
}));
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

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }

    return res.sendFile(frontendIndexPath);
  });
}

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found`, data: null });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(() => {
  process.exit(1);
});

module.exports = app;
