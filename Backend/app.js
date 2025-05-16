const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const invoiceRouter = require('./routes/invoiceRoutes');
const customerRouter = require('./routes/customerRoutes');
const messageRouter = require('./routes/messageRoutes');

// ✅ Starts Express App
const app = express();
app.enable('trust proxy');

// ✅ Security and middleware
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: [
      'https://acme-website-frontend.onrender.com',
      'http://localhost:3000',
      'http://localhost:5000',
    ],
    credentials: true,
  }),
);

const limiter = rateLimit({
  max: 2000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in an hour!',
  proxy: true,
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// ✅ Static files (e.g., profile pictures)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Backend API routes
app.use('/api/users', userRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/customers', customerRouter);
app.use('/api/messages', messageRouter);

// ✅ Global error handler
app.use(globalErrorHandler);

module.exports = app;
