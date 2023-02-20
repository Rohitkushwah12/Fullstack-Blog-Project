const Post = require("../../model/post/post");
const User = require("../../model/user/user");
const appErr = require("../../utils/appErr");

const createPostCtrl = async (req, res, next) => {
  const { title, description, category, user } = req.body;
  try {
    if (!title || !description || !category || !req.file) {
      res.render("posts/addPost", {
        error: "All Fields are Required",
      });
    }
    // Find the user
    const userFound = await User.findById(req.session.userAuth);

    // Create the post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: req.session.userAuth,
      image: req.file.path,
    });

    // push the post created into the array of user's posts
    userFound.posts.push(postCreated._id);
    // re save
    await userFound.save();
    res.redirect("/api/v1/posts");
  } catch (error) {
    res.render("posts/addPost", {
      error: error.message,
    });
  }
};

const getPostsCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("comment").populate("user");
    res.render("posts/allPosts", {
      posts,
      error: "",
    });
  } catch (error) {
    res.render("posts/allPosts", {
      posts: "",
      error: error.message,
    });
  }
};

const getSinglePostCtrl = async (req, res, next) => {
  try {
    // 1. get the id from params
    const id = req.params.id;

    // 2. find the post
    const post = await Post.findById(id)
      .populate({
        path: "comment",
        populate: {
          path: "user",
        },
      })
      .populate("user");
    res.render("posts/postDetails", {
      post,
      error: "",
    });
  } catch (error) {
    res.render("posts/postDetails", {
      post: "",
      error: error.message,
    });
  }
};

const deletePostCtrl = async (req, res, next) => {
  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // check the post is belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      res.render("users/notAuthorize");
    } else {
      // delete post
      await Post.findByIdAndDelete(req.params.id);
      res.redirect("/");
    }
  } catch (error) {
    res.render("posts/userDetails", {
      post: "",
      error: error.message,
    });
  }
};

const updatePostCtrl = async (req, res, next) => {
  const { title, category, description } = req.body;
  try {
    if (!title || !category || !description) {
      res.render("posts/updatePost", {
        post: "",
        error: "All Fields are Required",
      });
    }
    // find the post
    const post = await Post.findById(req.params.id);
    // check the post is belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      res.render("users/notAuthorize");
    }
    // update post
    const postUpdated = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        description,
        image: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/");
  } catch (error) {
    res.render("posts/updatePost", {
      post: "",
      error: error.message,
    });
  }
};
module.exports = {
  createPostCtrl,
  getPostsCtrl,
  getSinglePostCtrl,
  deletePostCtrl,
  updatePostCtrl,
};
