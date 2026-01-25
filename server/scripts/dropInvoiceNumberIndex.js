import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropInvoiceNumberIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plusprotech');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('invoices');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Try to drop the invoiceNumber index if it exists
    try {
      await collection.dropIndex('invoiceNumber_1');
      console.log('Successfully dropped invoiceNumber_1 index');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('Index invoiceNumber_1 does not exist or already dropped');
      } else {
        throw error;
      }
    }

    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropInvoiceNumberIndex();
