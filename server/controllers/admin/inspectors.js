import { Inspector } from "../../models/inspector.js";

const INSPECTOR_STATUSES = ["pending", "under_review", "approved", "rejected", "suspended"];
const UPDATABLE_STATUSES = ["under_review", "approved", "rejected", "suspended"];
const inspectorListSelect = "-password";

export const fetchInspectorsAsPerStatus = async (req, res) => {
    const status = req.query.status || req.body.status;
    try {
        if (!INSPECTOR_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${INSPECTOR_STATUSES.join(", ")}`,
            });
        }

        const inspectors = await Inspector.find({ status }).select(inspectorListSelect);

        return res.status(200).json({
            success: true,
            message: "Inspectors fetched successfully.",
            inspectors,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching inspectors: ${err.message}`,
        });
    }
}

export const approveRejectPendingInspectors = async (req, res) => {
    try {
        const { inspectorId } = req.params;
        const { status } = req.body;

        if (!UPDATABLE_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${UPDATABLE_STATUSES.join(", ")}`,
            });
        }

        if (!inspectorId) {
            return res.status(400).json({
                success: false,
                message: "Inspector ID is required.",
            });
        }

        const update = {
            status,
            reviewedAt: new Date(),
        };

        if (status === "approved") {
            update.approvedAt = new Date();
        }

        const updatedInspectorStatus = await Inspector.findByIdAndUpdate(
            inspectorId,
            { $set: update },
            { new: true }
        ).select(inspectorListSelect);

        if (!updatedInspectorStatus) {
            return res.status(404).json({
                success: false,
                message: "Inspector not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Inspector status updated to ${status} successfully.`,
            updatedInspectorStatus,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while approving inspector: ${error.message}`,
        });
    }
}

export const fetchAllInspectors = async (req, res) => {
    try {
        const allInspectors = await Inspector.find({}).select(inspectorListSelect);

        return res.status(200).json({
            success: true,
            message: "Inspectors fetched successfully.",
            inspectors: allInspectors,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching inspectors: ${error.message}`,
        });
    }
}
