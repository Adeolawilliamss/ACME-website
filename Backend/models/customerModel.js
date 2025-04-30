const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo: { type: String, default: 'default.jpg' },
  email: {
    type: String,
    required: true,
  },
  profileImage: String,
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
