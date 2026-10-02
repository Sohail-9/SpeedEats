const mongoose = require("mongoose");
const { Schema, model } = mongoose;

/**
 * Mongoose schema for the User model.
 */
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    profileImage: { type: String, required: true },
});

/**
 * Mongoose model for the User schema.
 */
const User = model("User", userSchema);

module.exports = User;
