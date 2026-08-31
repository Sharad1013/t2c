import { Inspector } from "../models/inspector.js";
import { User } from "../models/user.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerInspector = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            phone,
            dateOfBirth,
            "address.street": street,
            "address.city": city,
            "address.state": state,
            "address.pincode": pincode,
            serviceablePincodes,
            "kyc.aadhaar.number": aadhaarNumber,
            "kyc.pan.number": panNumber,
            "vehicle.type": vehicleType,
            "vehicle.name": vehicleName,
            "vehicle.registrationNumber": vehicleRegNumber,
            "bankDetails.accountHolderName": accountHolderName,
            "bankDetails.accountNumber": accountNumber,
            "bankDetails.ifscCode": ifscCode,
            "bankDetails.upiId": upiId,
        } = req.body;

        if (!fullName || !email || !password || !phone || !dateOfBirth) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        if (!vehicleType) {
            return res.status(400).json({ message: "Vehicle type is required." });
        }

        if (!aadhaarNumber && !panNumber) {
            return res.status(400).json({ message: "At least one KYC document (Aadhaar or PAN) is required." });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingInspector = await Inspector.findOne({ email: normalizedEmail });
        if (existingInspector) {
            return res.status(409).json({
                success: false,
                message: "An inspector account with this email already exists.",
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered as a user. Use a different email to register as an inspector.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const files = req.files || {};

        let profilePhotoUrl = null;
        let aadhaarFrontUrl = null;
        let aadhaarBackUrl = null;
        let panImageUrl = null;
        let rcImageUrl = null;

        if (files.profilePhoto?.[0]) {
            const uploaded = await uploadToCloudinary(files.profilePhoto[0].buffer, "inspector-profiles");
            profilePhotoUrl = uploaded.secure_url;
        }

        if (files.aadhaarFront?.[0]) {
            const uploaded = await uploadToCloudinary(files.aadhaarFront[0].buffer, "inspector-kyc");
            aadhaarFrontUrl = uploaded.secure_url;
        }

        if (files.aadhaarBack?.[0]) {
            const uploaded = await uploadToCloudinary(files.aadhaarBack[0].buffer, "inspector-kyc");
            aadhaarBackUrl = uploaded.secure_url;
        }

        if (files.panImage?.[0]) {
            const uploaded = await uploadToCloudinary(files.panImage[0].buffer, "inspector-kyc");
            panImageUrl = uploaded.secure_url;
        }

        if (files.rcImage?.[0]) {
            const uploaded = await uploadToCloudinary(files.rcImage[0].buffer, "inspector-vehicles");
            rcImageUrl = uploaded.secure_url;
        }

        const maskedAadhaar = aadhaarNumber
            ? `XXXX-XXXX-${aadhaarNumber.toString().slice(-4)}`
            : null;

        const inspector = await Inspector.create({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            dateOfBirth,
            profilePhoto: profilePhotoUrl,
            role: "inspector",
            address: { street, city, state, pincode },
            serviceablePincodes: serviceablePincodes
                ? JSON.parse(serviceablePincodes)
                : [],
            kyc: {
                aadhaar: {
                    number: maskedAadhaar,
                    frontImage: aadhaarFrontUrl,
                    backImage: aadhaarBackUrl,
                },
                pan: {
                    number: panNumber || null,
                    image: panImageUrl,
                },
            },
            vehicle: {
                type: vehicleType,
                name: vehicleName,
                registrationNumber: vehicleRegNumber,
                rcImage: rcImageUrl,
            },
            bankDetails: {
                accountHolderName,
                accountNumber,
                ifscCode,
                upiId,
            },
        });

        return res.status(201).json({
            success: true,
            message: `Inspector ${inspector.fullName} registered successfully. Your account is under review.`,
            inspector: {
                id: inspector._id,
                fullName: inspector.fullName,
                email: inspector.email,
                role: inspector.role,
                status: inspector.status,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Internal server error while registering as an inspector: ${err.message}`,
        });
    }
};

export const loginInspector = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hasMissingField = [email, password].some((item) => item == null || item === "");

        if (hasMissingField) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        const existingInspector = await Inspector.findOne({ email: email.trim().toLowerCase() });

        if (!existingInspector) {
            return res.status(404).json({
                success: false,
                message: "No inspector found with this email.",
            });
        }

        const passwordIsCorrect = await bcrypt.compare(password, existingInspector.password);

        if (!passwordIsCorrect) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password.",
            });
        }

        const token = jwt.sign(
            {
                userId: existingInspector._id,
                email: existingInspector.email,
                role: existingInspector.role,
            },
            process.env.JWTSECRETKEY,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            token,
            role: existingInspector.role,
            message: `Hi, ${existingInspector.fullName}`,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${err.message}`,
        });
    }
};

export const getLoggedInInspector = async (req, res) => {
    try {
        if (req.user.role !== "inspector") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Inspector account required.",
            });
        }

        const inspector = await Inspector.findById(req.user.userId).select("-password");

        if (!inspector) {
            return res.status(404).json({
                success: false,
                message: "No logged in inspector found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logged in inspector fetched successfully.",
            inspector,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching the logged in inspector.",
        });
    }
};

export const toggleInspectorAvailability = async (req, res) => {
    try {
        if (req.user.role !== "inspector") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Inspector account required.",
            });
        }

        const inspector = await Inspector.findById(req.user.userId);

        if (!inspector) {
            return res.status(404).json({
                success: false,
                message: "No logged in inspector found.",
            });
        }

        if (inspector.status !== "approved") {
            return res.status(403).json({
                success: false,
                message: "Your account must be approved before you can go online.",
            });
        }

        inspector.isAvailable = !inspector.isAvailable;
        await inspector.save();

        const updatedInspector = await Inspector.findById(inspector._id).select("-password");

        return res.status(200).json({
            success: true,
            message: updatedInspector.isAvailable
                ? "You are now online and can receive pickup requests."
                : "You are now offline.",
            inspector: updatedInspector,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error while updating availability.",
        });
    }
};

export const updateInspector = async (req, res) => {
    try {
        if (req.user.role !== "inspector") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Inspector account required.",
            });
        }

        const {
            fullName,
            phone,
            "address.street": street,
            "address.city": city,
            "address.state": state,
            "address.pincode": pincode,
            "bankDetails.accountHolderName": accountHolderName,
            "bankDetails.accountNumber": accountNumber,
            "bankDetails.ifscCode": ifscCode,
            "bankDetails.upiId": upiId,
            "vehicle.name": vehicleName,
            "vehicle.registrationNumber": vehicleRegNumber,
            "vehicle.type": vehicleType,
        } = req.body;

        const updates = {};

        if (fullName) updates.fullName = fullName;
        if (phone) updates.phone = phone;
        if (street || city || state || pincode) {
            updates.address = {};
            if (street) updates.address.street = street;
            if (city) updates.address.city = city;
            if (state) updates.address.state = state;
            if (pincode) updates.address.pincode = pincode;
        }
        if (accountHolderName || accountNumber || ifscCode || upiId) {
            updates.bankDetails = {};
            if (accountHolderName) updates.bankDetails.accountHolderName = accountHolderName;
            if (accountNumber) updates.bankDetails.accountNumber = accountNumber;
            if (ifscCode) updates.bankDetails.ifscCode = ifscCode;
            if (upiId) updates.bankDetails.upiId = upiId;
        }
        if (vehicleName || vehicleRegNumber || vehicleType) {
            updates.vehicle = {};
            if (vehicleName) updates.vehicle.name = vehicleName;
            if (vehicleRegNumber) updates.vehicle.registrationNumber = vehicleRegNumber;
            if (vehicleType) updates.vehicle.type = vehicleType;
        }

        // handle profile photo upload
        const files = req.files || {};
        if (files.profilePhoto?.[0]) {
            const uploaded = await uploadToCloudinary(files.profilePhoto[0].buffer, "inspector-profiles");
            updates.profilePhoto = uploaded.secure_url;
        }

        const updatedInspector = await Inspector.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedInspector) {
            return res.status(404).json({ success: false, message: "Inspector not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            inspector: updatedInspector,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error while updating inspector profile: ${err.message}`,
        });
    }
};
