const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { generateToken, verifyToken } = require('./auth'); // Import the generateToken and verifyToken functions

const app = express();
app.use(express.json());
app.use(cors());
 
// MongoDB connection URL
const url1 = "mongodb+srv://jawad404:Jawad818@myhub.7k4rzfk.mongodb.net/BlogApp?retryWrites=true&w=majority&appName=myhub"
// const URL = "mongodb+srv://jawad404:Jawad818@myhub.7k4rzfk.mongodb.net/BlogApp?retryWrites=true&w=majority";

// MongoDB connection options
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// MongoDB connection
mongoose.connect(url1, connectOptions)
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


    // Create a new user object
    user = new User({
      username,
      email,
      password,
    });

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({ message: "User registered successfully", token, username });
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
    if(password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    // Generate JWT token
    const token = generateToken(user);
  
    // Login successful
    res.status(200).json({ message: "Login successful", token, username: user.username});
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
  console.log("Received request to create post:", req.body);

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

// Update Post
app.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    console.log(`Updating post: ${id}`, req.body);

    const post = await Post.findByIdAndUpdate(id, { title, content }, { new: true });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
});

// Delete Post
app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deleting post: ${id}`);

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});


// Comments Schema
const CommentsSchema = new mongoose.Schema({
  username : {type: String, required: true},
  postid : {type: String, required: true},
  comments: {type: String, required: true},
})

const Comment = mongoose.model("Comments", CommentsSchema);

// Add comments
app.post("/comments", async (req, res) => {
  console.log("Received request to create comment:", req.body);

  try {
    const { username, postid, comments } = req.body;

    // Create a new comment object
    const comment = new Comment({
      username,
      postid,
      comments,
    });

    // Save the comment to the database
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).json({ message: "Error saving comment", error: error.message });
  }
});


// Get all comments
app.get("/comments", async (req, res) => {
  try {
    const comment = await Comment.find();
    res.status(200).json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({ message: "Error fetching comment", error: error.message });
  }
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}!`);
});
