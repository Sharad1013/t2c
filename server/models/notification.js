import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientModel: {
        type: String,
        required: true,
        default: 'Inspector'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel',
        index: true,
    },
    type: {
        type: String,
        default: 'PICKUP_REGISTERED'
    },
    pickup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pickups'
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    }
}, { timestamps: true })

export const Notification = mongoose.model('Notification', notificationSchema)