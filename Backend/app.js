const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const next = require('next');

const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const invoiceRouter = require('./routes/invoiceRoutes');
const customerRouter = require('./routes/customerRoutes');
const messageRouter = require('./routes/messageRoutes');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({
  dev,
  dir: path.join(__dirname, '../ACME-website'),
});
const handle = nextApp.getRequestHandler();

// Starts express App
const app = express();
app.enable('trust proxy');

nextApp.prepare().then(() => {
  // ✅ Security and middleware
  app.use(helmet());
  if (dev) app.use(morgan('dev'));

  const limiter = rateLimit({
    max: 2000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try again in an hour!',
  });
  app.use('/api', limiter);

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(compression());

  // ✅ User uploads (e.g., profile pictures)
  app.use(express.static(path.join(__dirname, 'public')));

  // ✅ Your backend API routes
  app.use('/api/users', userRouter);
  app.use('/api/invoices', invoiceRouter);
  app.use('/api/customers', customerRouter);
  app.use('/api/messages', messageRouter);

  app.use(globalErrorHandler);

  // ✅ All other routes handled by Next.js
  app.all('*', (req, res) => handle(req, res));
});

module.exports = app;
