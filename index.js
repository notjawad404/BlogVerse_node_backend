const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection URL
const URL = "mongodb+srv://jawad404:Jawad818@myhub.7k4rzfk.mongodb.net/BlogApp?retryWrites=true&w=majority";

// MongoDB connection options
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// MongoDB connection
mongoose.connect(URL, connectOptions)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// User Schema and Model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);

// Register User
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// Login User
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Login successful
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user", error: error.message });
  }
});

// Post Schema
const PostSchema = new mongoose.Schema({
  username: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

const Post = mongoose.model("Posts", PostSchema);

// Create a new post
app.post("/posts", async (req, res) => {
  try {
    const { username, title, content } = req.body;

    // Create a new post object
    const post = new Post({
      username,
      title,
      content,
    });

    // Save the post to the database
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Error saving post", error: error.message });
  }
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// Search post by title
app.get("/posts/search/:title", async (req, res) => {
  try {
    const title = req.params.title;

    // Find the post by title in the database
    const post = await Post.findOne({ title });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
});

// Get all posts of specific user
app.get("/posts/user/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Find all posts by the username in the database
    const posts = await Post.find({ username });

    if (posts.length === 0) {
      return res.status(404).json({ message: "Posts not found" });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}!`);
});
