import { User } from "../../models/user.js";

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({}).select("-password");

        if (allUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Users Found'
            })
        }

        return res.status(200).json({
            success: true,
            message: `${allUsers.length} users fetched successfully.`,
            users: allUsers,
        })

    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: 'Error while fetching all users.'
            })
    }
}