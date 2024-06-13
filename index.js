
const express = require('express');
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { check, validationResult } = require('express-validator');
const cors = require('cors');

const URL = 'mongodb+srv://jawad404:Jawad818@myhub.7k4rzfk.mongodb.net/BlogApp?retryWrites=true&w=majority&appName=myhub';

// const JWT_SECRET =  'secret';


const app = express();
app.use(express.json());
app.use(cors());


// MongoDB connection
mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error(err.message);
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

const User = mongoose.model('User', UserSchema);

// Register User
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email, password });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    else {
      user = new User({
        username,
        email,
        password,
      });

      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});


// Login User
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne ({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    else {
      res.status(200).json({ message: 'Login successful' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user', error: error.message });
  }
} );





// Post Schema

const PostSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
});

const Post = mongoose.model('Posts', PostSchema);

app.post('/posts', async (req, res) => {
    try {
        const { username, title, content, date } = req.body;
        console.log("Request Body: ", req.body);

        // Validate that all required fields are present
        if (!title || !content || !date) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new post object
        const post = new Post({
            username,
            title,
            content,
            date: new Date(date),
        });

        // Save the post to the database
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ message: 'Error saving post', error: error.message });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
});

app.listen(5000, () => {
    console.log('Server has started on port 5000!');
});
 