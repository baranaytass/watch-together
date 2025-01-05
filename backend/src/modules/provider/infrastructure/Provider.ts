import mongoose from 'mongoose';
import { Provider } from '../types';

const providerSchema = new mongoose.Schema<Provider>({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  selector: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<Provider>('Provider', providerSchema); 