const express = require('express');
const mongoose = require('mongoose');
const bodtParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const URL = 'mongodb+srv://jawad404:Jawad818@myhub.7k4rzfk.mongodb.net/Notepad?retryWrites=true&w=majority&appName=myhub';

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
