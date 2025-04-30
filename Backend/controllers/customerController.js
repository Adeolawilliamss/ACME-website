const catchAsync = require('../utils/catchAsync');
const Customer = require('../models/customerModel');

exports.createCustomers = catchAsync(async (req, res, next) => {
  const customersData = req.body;
  const customers = await Customer.create(customersData);

  res.status(200).json({
    status: 'success',
    data: {
      customers,
    },
  });
});

exports.getCustomer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const customer = await Customer.findById(id);

  if (!customer) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Customer not found' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      customer: {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        photo: customer.photo,
      },
    },
  });
});

exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const customers = await Customer.find();
  res.status(200).json({
    status: 'success',
    data: {
      customers,
    },
  });
});
