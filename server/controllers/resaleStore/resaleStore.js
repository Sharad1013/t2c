import { ResaleStoreProducts } from "../../models/resaleStore/resaleStoreProducts.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { analyzeProductImage } from "../../utils/geminiService.js";
import { estimateResaleCoins } from "../../utils/coinsService.js";
import { User } from "../../models/user.js";

export const createResaleProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            stock,
            lng,
            lat,
        } = req.body;

        if (lng === undefined || lat === undefined) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Product location is required."
                });
        }

        const userId = req.user?.userId;

        if (!userId) {
            return res.status(403)
                .json({
                    message: `Login First.`
                })
        }

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404)
                .json(
                    {
                        message: `User not found.`
                    }
                )
        }

        const imageUrls = [];
        let aiAnalysis = null;

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadedImage = await uploadToCloudinary(
                    file.buffer,
                    "resale-products"
                );

                imageUrls.push(uploadedImage.secure_url);
            }

            // analyse the images using gemini ai.
            try {
                aiAnalysis = await analyzeProductImage(
                    req.files
                );
            } catch (aiErr) {
                console.error("AI analysis failed:", aiErr.message);
            }
        }

        const resaleProduct = await ResaleStoreProducts.create({
            seller: existingUser._id,
            name,
            brand,
            stock: Number(stock),
            imageUrls,
            status: "pending_review",
            location: {
                type: "Point",
                coordinates: [Number(lng), Number(lat)],
            },
            ...(aiAnalysis?.category && { estimatedResaleCoins: estimateResaleCoins(aiAnalysis.category) }),
            ...(aiAnalysis?.description && { description: aiAnalysis.description }),
        });

        return res.status(201).json({
            success: true,
            message: "Resale product created successfully and sent for admin review",
            resaleProduct
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while creating resale product ${error}`
        })
    }
}

export const getAllResaleProductsPerSeller = async (req, res) => {

    const userId = req.user.userId;

    if (!userId) {
        return res.status(403)
            .json({
                success: true,
                message: `Login First.`
            })
    }

    try {
        const allResaleProducts = await ResaleStoreProducts.find({
            seller: userId
        });

        if (!allResaleProducts.length) {
            return res.status(404)
                .json({
                    success: true,
                    message: `No Resale Product Found.`,
                    allResaleProducts
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: `fetched ${allResaleProducts.length} resale products`,
                allResaleProducts
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching all resale products ${error}`
        })
    }
}

export const deleteResaleProduct = async (req, res) => {
    const { productToDelete } = req.params;

    if (!productToDelete) {
        return res.status(404)
            .json({
                success: true,
                message: `No product to delete.`
            })
    }

    const userId = req.user.userId;

    if (!userId) {
        return res.status(403)
            .json({
                success: true,
                message: `Login First.`
            })
    }

    // match the owner of the product.
    const product = await ResaleStoreProducts.findById(productToDelete);

    if (!product) {
        return res.status(404)
            .json({
                success: false,
                message: `No product found.`
            })
    }

    if (product.seller.toString() !== userId) {
        return res.status(403)
            .json({
                success: false,
                message: `You are not authorized to delete this product.`
            })
    }

    try {
        const deletedProduct = await ResaleStoreProducts.deleteOne({
            _id: productToDelete,
        })


        return res.status(200)
            .json({
                success: true,
                message: `Product deleted successfully.`,
                deletedProduct
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while deleting resale product ${error}`
        })
    }



}