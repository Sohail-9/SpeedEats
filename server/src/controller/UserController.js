const { Request, Response } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const { SendEmail, template } = require("../mailer/Mailer");
const { Types } = require("mongoose");
const { log } = require("../lib/helper");

const UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials!" });
            return;
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials!" });
            return;
        }

        // Create JWT payload
        const payload = {
            id: user._id,
            email: user.email,
            role: "user",
        };

        // Sign token
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, { expiresIn: "1d" });

        // Email template
        const Template = template.login(user.email, user.name);

        // Send login success email
        await SendEmail(email, "Login Successful", Template);

        res.status(200).json({ message: "Logged in successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Server error, please try again later." });
    }
};

const UserRegister = async (req, res) => {
    try {
        const { name, email, password, mobile, profileImage } = req.body;

        // Validate required fields
        if (!name || !email || !password || !mobile) {
            res.status(400).json({ message: "All fields are required!" });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists!" });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
            profileImage:
                profileImage || "https://default-profile-image-url.com/default.png",
        });
        await newUser.save();

        // Email template
        const Template = template.register(name, email);
        // Send registration success email
        await SendEmail(email, "Registration Successful", Template);

        res.status(201).json({
            message: "User registered successfully",
            user: { name, email, mobile, profileImage },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
};

const UserDetails = async (req, res) => {
    try {
        // Implement the user details retrieval logic here
    } catch (error) {
        log.error(`Registration error: ${error}`);
        res.status(500).json({ message: "Server error, please try again later." });
    }
};

module.exports = {
    UserLogin,
    UserRegister,
    UserDetails,
};
