const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// POST route to add a person (signup)
router.post("/signup", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the body

    const data = req.body;

    // Create and save the new user document
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("Data saved");

    const payload = {
      id: response.id,
      role: response.role,
    };

    const token = generateToken(payload);
    console.log("Token is:", token);

    // Respond with the saved document and the generated token
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// POST route for login
router.post("/login", async (req, res) => {
  try {
    // Extract aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    // Find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    // Generate token with payload
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = generateToken(payload);

    // Return token as response
    res.json({ token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userdata = req.user;
    console.log("user data:", userdata);
    const userId = userdata.id;
    const user = await User.findById(userId); // Corrected from Person.findById
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// PUT route to update password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  // Added jwtAuthMiddleware
  try {
    const userId = req.user.id; // Extract the id from the token
    const { currentPassword, newPassword } = req.body; // Extract the current and new password from the request body

    // Find the user by userID
    const user = await User.findById(userId);

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();
    console.log("password updated");
    res.status(200).json({ message: "password updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
