// middlewares/roleMiddleware.js
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // authMiddleware must have run first and set req.user
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: admins only" });
        }
        next();
    };
};