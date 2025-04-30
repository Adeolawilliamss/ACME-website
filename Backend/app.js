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

//Starts express App immediately
const app = express();

app.enable('trust proxy');

//GLOBAL MIDDLEWARES:THESE ARE APPLIED TO ALL FILES

const allowedOrigins = [
  'http://localhost:3000', // React default (Vite)
  'https://acme-website-115r.onrender.com',
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// ✅ Serve user-uploaded files from /public
app.use(express.static(path.join(__dirname, 'public')));

//Set security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('trust proxy', 2);

//Limit requests from same API
const limiter = rateLimit({
  max: 2000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,try again in an hour!',
});
app.use('/api', limiter);

//Body parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Cookie parser middleware
app.use(cookieParser()); // Parse cookies and make them available in req.cookies

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS(cross side sripting attacks)
app.use(xss());

app.use(compression());

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  //console.log(req.cookies);
  next();
});

//ROUTES
app.use('/api/users', userRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/customers', customerRouter);
app.use('/api/messages', messageRouter);

app.use(globalErrorHandler);

module.exports = app;
