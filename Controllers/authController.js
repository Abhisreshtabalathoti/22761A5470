const { User } = require("../models/User");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// **Register User**
exports.register = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body); // Debugging log

    const { companyName, ownerName, rollNo, ownerEmail, accessCode } = req.body;

    // **Validate Required Fields**
    if (!companyName || !ownerName || !rollNo || !ownerEmail || !accessCode) {
      console.error("Missing Fields:", { companyName, ownerName, rollNo, ownerEmail, accessCode });
      return res.status(400).json({ error: "All fields are required" });
    }

    // **Validate Access Code**
    if (accessCode !== process.env.ACCESS_CODE) {
      console.error("Invalid Access Code:", accessCode);
      return res.status(403).json({ error: "Invalid access code" });
    }

    // **Check if user already exists**
    let user = await User.findOne({ ownerEmail });
    if (user) {
      console.error("User already exists with email:", ownerEmail);
      return res.status(400).json({ error: "User already registered" });
    }

    // **Generate clientId and clientSecret**
    const clientId = uuidv4();
    const clientSecret = uuidv4();

    // **Save user to database**
    user = new User({ companyName, ownerName, rollNo, ownerEmail, clientId, clientSecret });
    await user.save();

    console.log("User registered successfully:", { ownerEmail, clientId });

    res.status(201).json({
      message: "Registration successful",
      companyName,
      clientId,
      clientSecret,
      ownerName,
      ownerEmail,
      rollNo,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// **Get Authentication Token**
exports.getAuthToken = async (req, res) => {
  try {
    console.log("Received Auth Request:", req.body); // Debugging log

    const { clientId, clientSecret } = req.body;

    // **Validate Input**
    if (!clientId || !clientSecret) {
      console.error("Missing credentials:", { clientId, clientSecret });
      return res.status(400).json({ error: "Client ID and Client Secret are required" });
    }

    // **Find user in database**
    const user = await User.findOne({ clientId, clientSecret });
    if (!user) {
      console.error("Invalid Client ID or Client Secret:", { clientId, clientSecret });
      return res.status(401).json({ error: "Invalid Client ID or Client Secret" });
    }

    // **Generate JWT Token**
    const token = jwt.sign(
      { clientId, companyName: user.companyName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("User authenticated:", { clientId });

    res.json({
      message: "Authentication successful",
      token_type: "Bearer",
      access_token: token,
      expires_in: 3600,
    });
  } catch (error) {
    console.error("Auth Token error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
