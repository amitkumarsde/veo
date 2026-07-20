import jwt from "jsonwebtoken";

// Verify the JWT from the Authorization header and attach the user to the request.
const auth = (req, res, next) => {

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret not configured." });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

export default auth;
