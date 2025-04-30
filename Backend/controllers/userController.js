const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  console.log('Users found:', users.length);

  res.status(200).json({
    status: 'Success',
    length: users.length,
    data: {
      users,
    },
  });
});
