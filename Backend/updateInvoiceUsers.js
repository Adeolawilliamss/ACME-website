// updateInvoiceUsers.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/invoiceModel');

dotenv.config({ path: './config.env' });

async function updateInvoiceUsers() {
  try {
    // 1) connect
    await mongoose.connect(
      process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
    );
    console.log('✅ Connected to MongoDB');

    // 2) build the new ObjectId
    const newUserId = new mongoose.Types.ObjectId('6802bb0d876095588f179b63');

    // 3) update ALL invoices in one go
    const result = await Invoice.updateMany(
      {}, // match all documents
      { $set: { user: newUserId } },
    );

    console.log(
      `✅ Updated ${result.modifiedCount} invoices to user ${newUserId}`,
    );
  } catch (err) {
    console.error('❌ Error updating invoices:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

updateInvoiceUsers();
