const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const Candidate = require("./../models/candidate");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user.role === "admin";
  } catch (err) {
    console.error("Error checking admin role:", err);
    return false;
  }
};
// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" }); // Use return here
    }

    const data = req.body;

    // Create and save the new candidate data
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("Data saved");

    // Respond with the saved document
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    // Check if the user has an admin role
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    // Extract candidate ID from URL parameter
    const candidateID = req.params.candidateID;

    // Updated data for the candidate
    const updatedCandidateData = req.body;

    // Assuming you have a Candidate model
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run mongoose validators on update
      }
    );

    // Check if the candidate was found and updated
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    // Check if the user has an admin role
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    // Extract candidate ID from URL parameter
    const candidateID = req.params.candidateID;

    // Assuming you have a Candidate model
    const response = await Candidate.findByIdAndDelete(candidateID);

    // If the candidate was not found
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate deleted");
    res
      .status(200)
      .json({ message: "Candidate deleted successfully", candidate: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// let's start voting

router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID; // Ensure variable is declared with const or let
  const userID = req.user.id; // Ensure variable is declared with const or let

  try {
    // Find the candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Find the user document with the specified userID
    const user = await User.findById(userID); // Corrected variable name to userID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has already voted
    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Prevent admins from voting
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin is not allowed to vote" });
    }

    // Add the user's vote to the candidate's votes array and increment vote count
    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    // Update the user document to reflect that the user has voted
    user.isVoted = true;
    await user.save();

    // Respond with success message
    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// vote count

router.get("/vote/count", async (req, res) => {
  try {
    // Fetch all candidates and sort them by voteCount in descending order
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    // Map the candidates to return only the relevant fields (party and vote count)
    const voteRecord = candidates.map((candidate) => {
      return {
        party: candidate.party,
        count: candidate.voteCount,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// to gett all candidates

router.get("/all", async (req, res) => {
  try {
    const data = await Candidate.find();
    console.log("data fetched");
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
