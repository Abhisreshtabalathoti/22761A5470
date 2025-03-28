require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const morgan = require("morgan");
// const helmet = require("helmet");

const connectDB = require("./db");
const authRoutes = require("./routes/auth");

const app = express();

// Connect to database
connectDB();


app.use(express.json());
app.use(cors());

// app.use(morgan("dev")); // Logs requests


app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("API is running...");
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));
