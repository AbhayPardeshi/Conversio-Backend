import Post from "../models/posts.js";
import User from "../models/users.js";

const feedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total posts for pagination info
    const totalPosts = await Post.countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username email profilePicture");

    const totalPages = Math.ceil(totalPosts / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      action: "feedPosts",
      posts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasMore,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching feed posts" });
  }
};

const createPost = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    console.log(req.body);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const newPost = new Post({
      user: user._id,
      text: req.body.text,
      media: req.file ? [`/uploads/${req.file.filename}`] : [],
      likes: [],
      parentPost: req.body.parentPostId || null,
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

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if the user has already liked the post
    if (post.likes.includes(req.body.userId)) {
      // If yes, remove the like
      console.log("here 1");
      
      post.likes.pull(req.body.userId);
    } else {
      console.log("here 2");
      // If no, add the like
      post.likes.push(req.body.userId);
    }

    
    
    const updatedPost = await post.save();
    await updatedPost.populate("user", "username email profilePicture");
console.log(updatedPost);
    res.status(200).json({
      action: "postLiked",
      posts: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to like post" });
  }
};



const deletePost = (req, res) => {
  res.send("Delete a specific post");
};



export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, text } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const parentPost = await Post.findById(postId);
    if (!parentPost) return res.status(404).json({ error: "Post not found" });

    const comment = await Post.create({
      user: user._id,
      text,
      parentPost: parentPost._id,
      media: req.file ? [`/uploads/${req.file.filename}`] : [],
      likes: [],
    });

    const populatedComment = await comment.populate(
      "user",
      "username profilePicture"
    );

    res.status(201).json({
      action: "commentAdded",
      comment: populatedComment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

const fetchComments = (req, res) => {
  res.send("Fetch comments for a specific post");
};

export {
  feedPosts,
  createPost,
  getPost,
  likePost,
  deletePost,
  createComment,
  fetchComments,
};
