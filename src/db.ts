import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({path: '../.env'});

const conn : string = process.env.DB_STRING || ''

export const connectDB = async () => {
  try {
    await mongoose.connect(`${conn}`, { });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};
