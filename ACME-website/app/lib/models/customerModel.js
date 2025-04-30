import mongoose from "mongoose";

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

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
