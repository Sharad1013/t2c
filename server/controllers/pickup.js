import { Pickup } from "../models/pickup.js";
import { User } from "../models/user.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { analyzeWasteImages, compareWasteImages } from "../utils/geminiService.js";
import pickupEmitter from "../utils/pickupEmitter.js";

export const registerPickup = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400)
                .json({
                    message: `login first.`
                })
        }

        // find the user first
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404)
                .json(
                    {
                        message: `User not found.`
                    }
                )
        }


        // request body
        const { wasteTypes, notes } = req.body;

        if (!wasteTypes) {
            return res.status(400)
                .json({
                    message: `Please select atleast one waste type.`
                })
        }


        const imageUrls = [];
        let aiAnalysis = null;

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadedImage = await uploadToCloudinary(
                    file.buffer,
                    "pickup-images"
                );

                imageUrls.push(uploadedImage.secure_url);
            }

            // analyse the images using gemini ai.
            try {
                aiAnalysis = await analyzeWasteImages(
                    req.files
                );
            } catch (aiErr) {
                console.error("AI analysis failed:", aiErr.message);
            }
        }

        const pickup = await Pickup.create({
            user: existingUser._id,
            address: {
                pincode: existingUser.address.pincode,
                street: existingUser.address.street,
                city: existingUser.address.city,
                state: existingUser.address.state,
                country: existingUser.address.country
            },
            wasteTypes: wasteTypes,
            notes,
            imageUrls,
            aiAnalysis
        })

        res.status(201)
            .json({
                success: true,
                message: `Pickup Created Successfully, ${pickup._id}`,
                pickupId: pickup._id,
                aiAnalysis
            })

        pickupEmitter.emit('pickup:registered', pickup);

    } catch (err) {
        return res.status(500)
            .json({
                message: `Internal server error ${err.message}`
            })
    }
}

export const getPickUpsHistoryByUserId = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400)
                .json({
                    success: false,
                    message: `login first`
                })
        }

        // find the pickups associated with the user.
        const pickups = await Pickup.find({ user: userId });

        if (!pickups) {
            return res.status(404)
                .json({
                    success: false,
                    message: `No pickups found.`
                })
        }

        return res.status(200)
            .json({
                success: true,
                pickups
            })

    } catch (err) {
        return res.status(500)
            .json({
                success: false,
                message: `Internal Server Error, ${err.message}`
            })
    }
}

export const deletePickup = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pickupId } = req.params;

        if (!userId) {
            return res.status(400)
                .json({ message: "Login first." });
        }

        // find pickup
        const pickup = await Pickup.findById(pickupId);

        if (!pickup) {
            return res.status(404)
                .json({
                    success: false,
                    message: `No Pickup found.`
                })
        }

        // ownership check
        if (pickup.user.toString() !== userId) {
            return res.status(403)
                .json({
                    success: false,
                    message: `Not Authorized.`
                })
        }

        // deletion allowed only in the first 3 minute window
        const now = Date.now();

        const createdTime = new Date(pickup.createdAt).getTime();

        const diff = now - createdTime;

        const THREE_MINUTES_IN_MS = 3 * 60 * 1000;

        if (diff > THREE_MINUTES_IN_MS) {
            return res.status(403).json({
                success: false,
                message: `You can only delete within 3 minutes of creation.`
            });
        }

        await Pickup.deleteOne({ _id: pickupId });

        return res.status(200)
            .json({
                success: true,
                message: `Pickup deleted successfully.`
            })

    } catch (err) {
        return res.status(500)
            .json({
                success: false,
                message: `Internal Server Error, ${err.message}`
            })
    }
}

export const updatePickup = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pickupId } = req.params;

        if (!userId) {
            return res.status(401)
                .json({ message: "Unauthorized." });
        }

        const pickup = await Pickup.findOneAndUpdate(
            { _id: pickupId, status: "pending" },   // only matches if still unassigned
            { $set: { status: "assigned", inspectorId: userId } },
            { new: true }
        );

        if (!pickup) {
            return res.status(409).json(
                {
                    success: false,
                    message: "Pickup already assigned"
                }
            );
        }

        return res.status(200)
            .json({
                success: true,
                message: `Pickup assigned successfully.`
            })

    } catch (err) {
        return res.status(500)
            .json({
                success: false,
                message: `Internal Server Error, ${err.message}`
            })
    }
}

export const updatePickupStatusUsingOtp = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pickupId } = req.params;
        const { otp } = req.body;

        if (!otp) return res.status(400).json({ success: false, message: "OTP is required." });

        if (!userId) {
            return res.status(401)
                .json({ message: "Unauthorized." });
        }

        // Scope to THIS inspector's assigned pickup, and pull the creator's otp.
        const pickup = await Pickup.findOne(
            { _id: pickupId, status: "assigned" }
        ).populate("user", "otp");

        // const pickup = await Pickup.findOneAndUpdate(
        //     { _id: pickupId, status: "assigned" },
        //     { $set: { status: "picked_up" } },
        //     { new: true }
        // );

        if (!pickup) {
            return res.status(404)
                .json({ message: "Pickup not found." });
        }

        if (String(pickup.user?.otp) !== String(otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        // Guarded flip so it can only go assigned -> picked_up once.
        const updated = await Pickup.findOneAndUpdate(
            { _id: pickupId, status: "assigned" },
            { $set: { status: "picked_up", inspectorId: userId } },
            { new: true }
        );

        if (!updated) return res.status(409).json({ success: false, message: "Pickup already updated." });

        return res.status(200)
            .json({
                success: true,
                message: `Pickup marked as picked up.`
            })

    } catch (err) {
        return res.status(500)
            .json({
                success: false,
                message: `Internal Server Error, ${err.message}`
            })
    }
}

export const getPickupsPerInspector = async (req, res) => {
    try {
        const inspectorId = req.user.userId;

        if (!inspectorId) {
            return res.status(400)
                .json({
                    success: false,
                    message: `Inspector id is required.`
                })
        }

        const pickupsPerInspector = await Pickup.find({ inspectorId });

        if (pickupsPerInspector.length === 0) {
            return res.status(200).json({
                success: true,
                message: `No pickups found for this inspector.`
            })
        }

        const currentAssignedPickups = pickupsPerInspector.filter((p) => p.status === "assigned");
        const currentPickedUpPickups = pickupsPerInspector.filter((p) => p.status === "picked_up");
        const otherPickups = pickupsPerInspector.filter((p) => p.status !== "assigned" && p.status !== "picked_up");

        // console.log("current assigned pickups", currentAssignedPickups);
        // console.log("current other pickups", otherPickups);


        return res.status(200).json({
            success: true,
            message: `Fetched ${pickupsPerInspector.length} pickups.`,
            currentAssignedPickups,
            currentPickedUpPickups,
            otherPickups
        });

    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: `Error while fetching pickups per inspector. ${error}`
            })
    }
}

export const updatePickupStatusToDelivered = async (req, res) => {
    try {
        const inspectorId = req.user.userId;
        const { pickupId } = req.params;

        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            return res.status(404).json({ success: false, message: "Pickup not found." });
        }

        // only the assigned inspector, and only from the picked_up state
        if (String(pickup.inspectorId) !== String(inspectorId)) {
            return res.status(403).json({ success: false, message: "Not your pickup." });
        }

        if (pickup.status !== "picked_up") {
            return res.status(409).json({
                success: false,
                message: `Pickup is '${pickup.status}', not ready to deliver.`,
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "A verification photo is required.",
            });
        }

        if (!pickup.imageUrls?.length) {
            return res.status(422).json({
                success: false,
                message: "No original image on file to compare against.",
            });
        }

        // compare inspector's photo against the user's originals
        let verdict;
        try {
            verdict = await compareWasteImages(pickup.imageUrls, req.files);
        } catch (aiErr) {
            console.error("Image comparison failed:", aiErr.message);
            return res.status(502).json({
                success: false,
                message: "Could not verify the image right now. Try again.",
            });
        }

        if (!verdict.match || verdict.confidence < 80) {
            return res.status(422).json({
                success: false,
                message: "Image doesn't match the original pickup. Delivery not confirmed.",
                verdict,
            });
        }

        // store the inspector's proof photo too, then mark delivered
        // const uploaded = await uploadToCloudinary(req.files[0].buffer, "pickup-delivery-proof");

        const uploads = await Promise.all(
            req.files.map((f) => uploadToCloudinary(f.buffer, "pickup-delivery-proof"))
        );

        pickup.status = "delivered";
        pickup.deliveryImageUrls = uploads.map((u) => u.secure_url);
        pickup.deliveredAt = new Date();
        await pickup.save();

        const check = await Pickup.findById(pickupId);
        console.log("immediately after save, status =", check.status);

        return res.status(200).json({
            success: true,
            message: "Pickup marked as delivered.",
            verdict,
        });

    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: "Error while updating the pickup status to delivered",
            })
    }
}