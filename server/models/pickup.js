import { model, Schema } from "mongoose";

const pickUpSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    address: {
        pincode: String,
        street: String,
        city: String,
        state: String,
        country: String,
    },
    wasteTypes: {
        type: [String],
        enum: ["plastic", "paper", "metal", "glass", "organic", "mixed"],
        required: true
    },
    pickUpDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "assigned", "picked_up", "cancelled", "delivered"],
        default: "pending",
    },
    notes: {
        type: String,
    },
    imageUrls: {
        type: [String],
        default: [],
        validate: {
            validator: function (images) {
                return !images || images.length <= 3;
            },
            message: "You can upload a maximum of 3 images."
        }
    },
    aiAnalysis: {
        wasteType: String,
        estimatedWeightKg: Number,
        confidence: String,
        description: String,
        isRecyclable: Boolean
    },
    inspectorId: {
        type: Schema.Types.ObjectId,
        ref: "Inspector",
        default: null
    },
    deliveryImageUrls: {
        type: [String],
        default: [],
        validate: {
            validator: function (images) {
                return !images || images.length <= 3;
            },
            message: "You can upload a maximum of 3 images."
        }
    },
    deliveredAt: {
        type: Date,
        default: null
    },
}, { timestamps: true })

export const Pickup = model('Pickups', pickUpSchema);