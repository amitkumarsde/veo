import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Register a new user.
export const signup = async (req, res) => {
    const { username, email, password, avatarURL } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const field = existingUser.username === username ? "Username" : "Email";
            return res.status(400).json({ message: `${field} already taken. Please try a different one.` });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ userId: username, username, email, password: hashedPassword, avatarURL });
        return res.status(201).json({ message: "Signed up successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Please try again." });
    }
};

// Sign in and return a JWT plus the user (without the password hash).
export const signin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "2d" });
        const safeUser = user.toObject();
        delete safeUser.password;
        return res.status(200).json({ message: "Signed in successfully.", token, user: safeUser });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Please try again." });
    }
};
