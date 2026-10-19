import { Schema, model } from "mongoose";

const resaleStoreProductsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null,
    },
    imageUrls: {
        type: [String],
        required: true,
        validate: { validator: (a) => a.length > 0, message: "At least one image is required." }
    },
    brand: {
        type: String,
    },
    stock: {
        type: Number,
        min: 0,
        default: 1,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],   // [longitude, latitude] — lng FIRST, this trips everyone up
            required: true,
        },
        address: { type: String },   // optional human-readable, for display
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending_review", "approved", "rejected", "live", "sold", "expired"],
        default: "pending_review",
    },
    rejectionReason: {
        type: String
    },
    estimatedResaleCoins: {
        type: Number,
        min: 0,
    },
    price: {
        type: Number,
        min: 0, // not required — admin sets this during verification
    },
    aiAnalysis: {
        category: String,
        confidence: String,
        description: String,
    },
    liveFrom: {
        type: Date,
        default: null,
    },
    liveTill: {
        type: Date,
        default: null,
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

resaleStoreProductsSchema.index({ location: "2dsphere" });

export const ResaleStoreProducts = model('ResaleStoreProducts', resaleStoreProductsSchema);