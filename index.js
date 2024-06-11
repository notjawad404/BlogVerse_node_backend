const express = require('express');
const mongoose = require('mongoose');
const bodtParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

const URL = 'mongodb+srv://jawad404:Jawad818@myhub.7k4rzfk.mongodb.net/BlogApp?retryWrites=true&w=majority&appName=myhub';

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.log("Error Connecting to MongoDB: ", error.message);
});


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

app.post('/signup', [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword,
        });

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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
