import Post from "../models/posts.js";
import User from "../models/users.js";

const feedPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "username email profilePicture");

  res.status(200).json({
    action: "feedPosts",
    posts: posts,
  });
};

const createPost = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newPost = new Post({
      user: user._id,
      text: req.body.text,
      media: req.file ? [`/uploads/${req.file.filename}`] : [],
      likes: [],
    });

    const savedPost = await newPost.save();

    // Populate the saved post
    const populatedPost = await savedPost.populate(
      "user",
      "username email profilePicture"
    );

    res.status(201).json({
      action: "postAdded",
      savedPost: populatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create post" });
  }
};


const getPost = (req, res) => {
  res.send("Get a specific post");
};

const updatePost = (req, res) => {
  res.send("Update a specific post");
};

const deletePost = (req, res) => {
  res.send("Delete a specific post");
};

export { feedPosts, createPost, getPost, updatePost, deletePost };
