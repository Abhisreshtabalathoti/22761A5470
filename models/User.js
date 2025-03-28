const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    ownerName: { type: String, required: true },
    rollNo: { type: String, required: true },
    ownerEmail: { type: String, required: true, unique: true },  // 🔹 Use camelCase
    clientId: { type: String, unique: true, required: true },
    clientSecret: { type: String, required: true }
});

// JWT Token Generator
userSchema.methods.generateAuthToken = function () {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Create User Model
const User = mongoose.model("User", userSchema);

// Validate User Input
const validateUser = (data) => {
    const schema = Joi.object({
        companyName: Joi.string().required().label("Company Name"),
        ownerName: Joi.string().required().label("Owner Name"),
        rollNo: Joi.string().required().label("Roll No"),
        ownerEmail: Joi.string().email().required().label("Email"),  // 🔹 Use camelCase
        clientId: Joi.string().required().label("Client ID"),
        clientSecret: passwordComplexity().required().label("Client Secret")
    });

    return schema.validate(data);
};

module.exports = { User, validateUser };
