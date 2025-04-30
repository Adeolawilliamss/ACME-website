// updateInvoiceUsers.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/invoiceModel');

dotenv.config({ path: './config.env' });

async function updateInvoiceUsers() {
  try {
    await mongoose.connect(
      process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    const newUserId = mongoose.Types.ObjectId('6802bb0d876095588f179b63');
    const { modifiedCount } = await Invoice.updateMany(
      {}, // match ALL invoices
      { $set: { user: newUserId } },
    );
    console.log(`✅ Updated ${modifiedCount} invoices to user ${newUserId}`);
  } catch (err) {
    console.error('❌ Error updating invoices:', err);
  } finally {
    await mongoose.disconnect();
  }
}

updateInvoiceUsers();
