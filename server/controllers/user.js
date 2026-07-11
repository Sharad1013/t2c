import { User } from "../models/user.js";
import { Inspector } from "../models/inspector.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/otpGenerator.js";

export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, password, address } = req.body;

        console.log("got the fields", { firstName, lastName, phone, email, password, address });
        const hasMissingFields = [firstName, lastName, phone, email, password, address].some((item) => item == null || item === "");

        if (hasMissingFields) {
            return res.status(400)
                .json({
                    message: "All fields are required."
                })
        }

        // if all fields are present move forward.
        // 1. find whether the mail exists.
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(404)
                .json({
                    message: "user already exists."
                })
        }

        const existingInspector = await Inspector.findOne({ email: normalizedEmail });
        if (existingInspector) {
            return res.status(409).json({
                message: "This email is registered as an inspector. Use a different email for a user account.",
            });
        }

        // 2. if not found then bcrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create(
            {
                firstName,
                lastName,
                phone,
                email,
                password: hashedPassword,
                address,
                otp: generateOTP()
            })

        if (newUser) {
            const { password: _, ...safeUser } = newUser.toObject();
            return res.status(201)
                .json({
                    success: true,
                    message: "User Created Successfully.",
                    newUser: safeUser
                })
        }
    } catch (err) {
        console.log(`error while registering the user ${err}`)
        return res.status(500)
            .json({
                success: false,
                message: err.message
            })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hasMissingField = [email, password].some(item => item == null || item === "")


        if (hasMissingField) {
            return res.status(400)
                .json({
                    success: false,
                    message: "all fields are required."
                })
        }

        // bcrypt compare the password if the user exists
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

        if (!existingUser) {
            return res.status(404)
                .json({
                    success: false,
                    message: "No user found with the email."
                })
        }

        const passwordIsCorrect = await bcrypt.compare(password, existingUser.password);

        if (!passwordIsCorrect) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Incorrect Password."
                })
        }


        // create token
        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                role: existingUser.role
            },
            process.env.JWTSECRETKEY,
            {
                expiresIn: "1d"
            }
        );


        return res.status(200)
            .json(
                {
                    success: true,
                    token,
                    role: existingUser.role,
                    message: `Hi, ${existingUser.firstName}`
                }
            )

    } catch (err) {
        return res.status(500)
            .json(
                {
                    success: false,
                    message: `Internal server error ${err.message}`
                }
            )
    }
}

export const getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404)
                .json({
                    success: false,
                    message: "No logged in user found."
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: "logged in user fetched successfully.",
                user
            })

    } catch (err) {
        return res.status(500)
            .json({
                success: false,
                message: 'Error while fetching the logged in user.'
            })
    }
}

export const updateLoggedInUser = async (req, res) => {
    try {
        // take the new data from req.body
        const { firstName, lastName, phone, email, password, address } = req.body;

        const updateUser = {};

        if (firstName) updateUser.firstName = firstName;
        if (lastName) updateUser.lastName = lastName;
        if (phone) updateUser.phone = phone;
        if (email) updateUser.email = email;
        if (address) updateUser.address = address;

        if (password) {
            updateUser.password = await bcrypt.hash(password, 10);
        }

        const updatedUser =
            await User.findByIdAndUpdate(
                req.user.userId,
                updateUser,
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");


        if (!updatedUser) {
            return res.status(400)
                .json({
                    success: false,
                    message: "User update failed."
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: "Profile Updated Successfully.",
                user: updatedUser
            });

    } catch (err) {
        return res.status(500)
            .json({
                success: false,
                message: "Error while updating the user."
            })
    }
}