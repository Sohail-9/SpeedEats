const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");

// Define the middleware function
const UserMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
        res.status(401).json({ message: "Access Denied: No Token Provided" });
        return;
    }

    try {
        const secretKey = process.env.JWT_SECRET || "yourSecretKey"; // Use a secure secret key
        const decoded = jwt.verify(token, secretKey);

        if (decoded.role !== "user") {
            res.status(401).json({ message: "Access Denied: You have no permissions" });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired" });
            return;
        }
        res.status(403).json({ message: "Invalid token" });
        return;
    }
};

module.exports = { UserMiddleware };
