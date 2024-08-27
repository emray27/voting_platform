const mongoose = require("mongoose");

// define the mongo connection URL
const mongoURL =
  "mongodb+srv://yash:yash6400@cluster0.jyonf2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// set up MongoDB connection
mongoose.connect(mongoURL);
// mongoose maintains a default connection object representing the MongoDB connection
const db = mongoose.connection;

// define event listeners for database connection

db.on("connected", () => {
  console.log("connected to mongoDB server");
});

db.on("error", (err) => {
  console.log("MongoDB connection error", err);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// export the database connection

module.exports = db;
