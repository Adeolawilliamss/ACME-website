const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Set access token in response headers (for Postman and frontend use)
  res.setHeader('Authorization', `Bearer ${accessToken}`);

  // Set access token in response
  res.cookie('jwt', accessToken, {
    expires: new Date(Date.now() + 60 * 60 * 1000), // 60 minutes
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: 'acme-website-115r.onrender.com',
  });

  // Set refresh token in a separate cookie
  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: 'acme-website-115r.onrender.com',
  });

  user.password = undefined; // Hide password in response

  res.status(statusCode).json({
    status: 'success',
    accessToken, // Send access token to client
    refreshToken,
    data: { user },
  });
};

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 403));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('Decoded JWT:', decoded); // Debugging

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 403));
    }

    const newAccessToken = signAccessToken(user._id);

    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    res.cookie('jwt', newAccessToken, {
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      httpOnly: true,
      secure: req.secure || req.get('x-forwarded-proto') === 'https',
    });

    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken,
    });
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token', 403));
  }
});

exports.logOut = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: req.secure || req.get('x-forwarded-proto') === 'https',
    sameSite: 'Lax',
    path: '/',
  });
  // Optionally clear refreshToken if set
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: req.secure || req.get('x-forwarded-proto') === 'https',
    sameSite: 'Lax',
    path: '/',
  });
  res.status(200).json({ status: 'success', message: 'Logged out' });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  // Send login response first
  createSendToken(newUser, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log('🔍 Protect Middleware Triggered on:', req.path); // Debugging
  //1}Getting token and checking if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to continue', 404),
    );
  }
  //2}Verify token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_ACCESS_SECRET,
  );

  //3}Check if user still exists
  const currentUser = await User.findById(decoded.id);
  // console.log('Current User:', currentUser);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401),
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_ACCESS_SECRET,
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return res
          .status(401)
          .json({ status: 'fail', message: 'Not logged in' });
      }

      req.user = currentUser;
      res.locals.user = currentUser;

      // ✅ Respond with user info or just status success
      return res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            photo: currentUser.photo,
            role: currentUser.role,
          },
        },
      });
    }

    // No token
    return res.status(401).json({ status: 'fail', message: 'Not logged in' });
  } catch (error) {
    return res.status(401).json({ status: 'fail', message: 'Invalid token' });
  }
};
