import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true,
    maxLength: [100, 'Car name cannot be more than 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in future']
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
    enum: ['economy', 'compact', 'suv', 'luxury', 'electric', 'hybrid']
  },
  price: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [1, 'Price must be at least $1']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    enum: ['downtown', 'airport', 'city-center', 'suburbs']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  features: [String],
  specifications: {
    seats: { type: Number, min: 1, max: 12 },
    transmission: { type: String, enum: ['Manual', 'Automatic', 'CVT'], default: 'Automatic' },
    fuel: { type: String, enum: ['Gasoline', 'Electric', 'Hybrid', 'Diesel'], default: 'Gasoline' },
    mileage: { type: String },
    engine: { type: String }
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host ID is required']
  },
  hostName: {
    type: String,
    required: [true, 'Host name is required']
  },
  available: { type: Boolean, default: true },
  instantBook: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0, min: 1, max: 5 },
  reviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  documents: {
    registration: { type: String },
    insurance: { type: String },
    inspection: { type: String }
  },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for performance
carSchema.index({ hostId: 1 });
carSchema.index({ type: 1, location: 1 });
carSchema.index({ available: 1, status: 1 });
carSchema.index({ price: 1 });
carSchema.index({ rating: -1 });

export default mongoose.models.Car || mongoose.model('Car', carSchema);

