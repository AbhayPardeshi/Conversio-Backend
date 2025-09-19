import User from "../models/users.js";
import Post from "../models/posts.js";

const bookmarkPost = async (req, res) => {
  console.log(req.body);

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const post = await Post.findById(req.body.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    console.log("user" + user, "post" + post);

    // Check if the post is already bookmarked
    if (user.bookmarkedPosts.includes(post._id)) {
      // If yes, remove the bookmark
      user.bookmarkedPosts.pull(post._id);
    } else {
      // If no, add the bookmark
      user.bookmarkedPosts.push(post._id);
    }

    await user.save();
    await post.populate("user", "username email profilePicture");
    res.status(200).json({
      action: "postBookmarked",
      postId: post._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to bookmark post" });
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "bookmarkedPosts", // populate posts
      populate: {
        path: "user", // inside Post, populate user
        select: "username profilePicture email", // only send needed fields
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      action: "userBookmarks",
      bookmarkedPosts: user.bookmarkedPosts, // send actual posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
};


export { bookmarkPost, getUserBookmarks };
