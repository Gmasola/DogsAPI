// src/model.ts
import mongoose, { Document } from 'mongoose';

export interface Dog extends Document {
  name: string;
  breed: string;
  age: number;
  status: 'available' | 'adopted' | 'in-custody';
  adoptionDate?: Date;
}

const dogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  status: { type: String, enum: ['available', 'adopted', 'in-custody'], required: true },
  adoptionDate: { type: Date }
});

export default mongoose.model<Dog>('Dog', dogSchema);


