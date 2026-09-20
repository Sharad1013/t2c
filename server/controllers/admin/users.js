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

export const deleteUser = async (req, res) => {
    const { userIdToDelete } = req.params;

    if (!userIdToDelete) {
        return res.status(400)
            .json({
                success: true,
                message: `No userId found to delete.`
            })
    }

    try {
        // stop if the user to delete is an admin.
        const existingUser = await User.findById({ _id: userIdToDelete });
        let isAdmin;
        if (existingUser) {
            isAdmin = existingUser.role === 'admin'
        }

        if (isAdmin) {
            return res.status(400)
                .json(
                    {
                        success: false,
                        message: `Unauthorized to delete an admin.`
                    }
                )
        }

        const deletedUser = await User.deleteOne({ _id: userIdToDelete });

        if (!deletedUser) {
            return res.status(400)
                .json({
                    success: false,
                    message: `User deletion failed.`
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: `User deleted Successfully.`,
                deletedUser
            })
    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: `Failed, While deleting the selected user.`
            })
    }
}