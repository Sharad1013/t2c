import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'first name is required.'],
        minLength: [2, "first name must be at least 2 characters."],
        maxLength: [25, "first name cannot exceed 24 characters."],
        trim: true,
        lowercase: true,
        default: "Anonymous",
        index: true,
    },
    lastName: {
        type: String,
        required: [true, 'last name is required.'],
        minLength: [2, "last name must be at least 2 characters."],
        maxLength: [25, "last name cannot exceed 24 characters."],
        trim: true,
        lowercase: true,
        default: "Anonymous",
        index: true,
    },
    phone: {
        type: String,
        required: [true, 'phone number is required.'],
        maxLength: [12, 'phone number cannot exceed 10 characters.'],
        minLength: [2, 'phone number must be atleast 2 characters.'],
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ]
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: [60, 'password must atleast 2 characters.'],
        maxLength: [60, 'password cannot exceed 6 characters.'],
    },
    address: {
        pincode: {
            type: String,
            required: true,
            trim: true,
            minLength: [6, 'pincode must be atleast 6 characters.'],
            maxLength: [6, 'pincode cannot exceed 6 characters.']
        },
        street: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
            required: true,
        }
    },
    role: {
        type: String,
        enum: ["user", "admin", "inspector"],
        default: "user"
    },
    otp: {
        type: String,
        required: true,
    },
    trashCoins: {
        type: String,
        default: "0"
    }
}, { timestamps: true });

export const User = mongoose.model('Users', userSchema);