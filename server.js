const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
const bodyParser = require("body-parser");

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

// Use the user routes
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
