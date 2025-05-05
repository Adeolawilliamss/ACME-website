const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/invoiceModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('✅ DB connection successful!'))
  .catch((err) => console.error('❌ DB connection error:', err));

const updateUserOnInvoices = async () => {
  try {
    const newUserId = '6818c76b67bc93e9fc4c49e1';

    const result = await Invoice.updateMany({}, { user: newUserId });

    console.log(
      `✅ Updated ${result.modifiedCount} invoices with new user ID.`,
    );
  } catch (err) {
    console.error('❌ Error updating invoices:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateUserOnInvoices();
