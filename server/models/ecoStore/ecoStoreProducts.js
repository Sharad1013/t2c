import { Schema, model } from 'mongoose';

const ecoStoreProductsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    mrp: {
        type: Number,
        min: 0,
        required: true,
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    maxCoinPercent: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },
    imageUrls: {
        type: [String],
        required: true,
        validate: { validator: (a) => a.length > 0, message: "At least one image is required." },
    },
    category: {
        type: String,
        index: true,
        required: true
    },
    subCategory: {
        type: String
    },
    brand: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        min: 0,
        default: 0,
        required: true
    },
    ratingAvg: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5
    },
    ratingCount: { 
        type: Number, 
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

// ↓ virtual goes HERE — after the schema, before model()
ecoStoreProductsSchema.virtual('discountedPrice').get(function () {
    const pct = this.discountPercentage || 0;
    return Math.round(this.mrp * (1 - pct / 100));
});

ecoStoreProductsSchema.set('toJSON', { virtuals: true });
ecoStoreProductsSchema.set('toObject', { virtuals: true });

export const EcoStoreProducts = model('EcoStoreProducts', ecoStoreProductsSchema);