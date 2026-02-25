import Post from "../models/posts.js";
import User from "../models/users.js";
import mongoose from "mongoose";
// const feedPosts = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Count total posts for pagination info
//     const totalPosts = await Post.countDocuments();

//     const posts = await Post.find({ parentPost: null })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("user", "username email profilePicture");

//     const totalPages = Math.ceil(totalPosts / limit);
//     const hasMore = page < totalPages;

//     res.status(200).json({
//       action: "feedPosts",
//       posts,
//       pagination: {
//         page,
//         limit,
//         totalPosts,
//         totalPages,
//         hasMore,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching feed posts" });
//   }
// };

const feedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments({ parentPost: null });
    const totalPages = Math.ceil(totalPosts / limit);
    const hasMore = page < totalPages;

    const posts = await Post.aggregate([
      { $match: { parentPost: null } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      // populate user
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // count comments for each post
      {
        $lookup: {
          from: "posts",
          let: { postId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$parentPost", "$$postId"] } } },
            { $count: "count" },
          ],
          as: "commentsCount",
        },
      },
      {
        $addFields: {
          commentsCount: {
            $ifNull: [{ $arrayElemAt: ["$commentsCount.count", 0] }, 0],
          },
        },
      },

      // only include needed user fields
      {
        $project: {
          user: {
            _id: 1,
            username: 1,
            email: 1,
            profilePicture: 1,
          },
          text: 1,
          media: 1,
          likes: 1,
          parentPost: 1,
          createdAt: 1,
          updatedAt: 1,
          commentsCount: 1,
          __v: 1,
        },
      },
    ]);

    res.status(200).json({
      action: "feedPosts",
      posts,
      pagination: { page, limit, totalPosts, totalPages, hasMore },
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
    res.status(500).json({ error: "Failed to create post" });
  }
};

const getPost = async (req, res) => {
  console.log(req.params);

  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "username email profilePicture"
    );
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.status(200).json({
      action: "getPost",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get post" });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if the user has already liked the post
    if (post.likes.includes(req.body.userId)) {
      // If yes, remove the like

      post.likes.pull(req.body.userId);
    } else {
      // If no, add the like
      post.likes.push(req.body.userId);
    }

    const updatedPost = await post.save();
    await updatedPost.populate("user", "username email profilePicture");

    res.status(200).json({
      action: "postLiked",
      posts: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to like post" });
  }
};

const deletePost = (req, res) => {
  res.send("Delete a specific post");
};

// POST /api/posts/:postId/comments
// body: { userId, text, parentPostId? }
const createComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, text, parentPostId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // parentPostId is optional: if present, reply to that comment
    const parentId = parentPostId || postId;

    const parentPost = await Post.findById(parentId);
    if (!parentPost) return res.status(404).json({ error: "Parent not found" });

    const comment = await Post.create({
      user: user._id,
      text,
      parentPost: parentId,
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




const fetchComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const data = await Post.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $graphLookup: {
          from: "posts",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentPost",
          as: "comments",
          depthField: "depth",
        },
      },
      { $project: { comments: 1 } },
      { $unwind: "$comments" },
      {
        $lookup: {
          from: "users",
          localField: "comments.user",
          foreignField: "_id",
          as: "comments.user",
        },
      },
      { $unwind: "$comments.user" },
      {
        $group: {
          _id: null,
          comments: { $push: "$comments" },
        },
      },
    ]);

    const comments = data[0]?.comments || [];
    res.status(200).json({ action: "allPostComments", comments });
  } catch (error) {
    res.status(500).json(error.message);
  }
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
