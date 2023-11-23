const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const cors = require("cors");
const User = require("./user-model");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://shiv1234:shiv12345@cluster0.ftpy9sv.mongodb.net/paras?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

app.post("/register", async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user already exists, return a 400 Bad Request response
      return res.status(400).json({ message: "User already exists" });
    }

    // If the user does not exist, create a new user
    const newUser = new User({
      email,
      password,
      fullName,
    });

    // Save the new user to the database
    await newUser.save();
    console.log("New user added");

    // Redirect to the root URL (adjust the path accordingly)
    return res.redirect("http://127.0.0.1:5500/index.html");
  } catch (error) {
    // Handle any errors that may occur during the registration process
    console.error("Registration error:", error);
    // You may want to handle errors more gracefully and provide a response to the client
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const isPasswordCorrect = await user.comparePassword(password);

      if (isPasswordCorrect) {
        return res.redirect("http://127.0.0.1:5500/index.html");

        console.log(user, "<-----/login (User found)");
      } else {
        res.send("Incorrect password");
        console.log("User found but incorrect password");
      }
    } else {
      res.send("User not found");
      console.log("User not found");
    }
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).send("An error occurred");
  }
});

app.get("/users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch data for the specified user
    const user = await User.findOne({ _id: `${userId}` });

    if (user) {
      res.json(user);
      console.log("User data retrieved");
    } else {
      res.json("User not found");
      console.log(user);
    }
  } catch (e) {
    res.status(500).json("An error occurred");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
