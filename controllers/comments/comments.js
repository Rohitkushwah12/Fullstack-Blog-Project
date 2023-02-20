const Comment = require("../../model/comment/comment");
const Post = require("../../model/post/post");
const User = require("../../model/user/user");
const appErr = require("../../utils/appErr");

const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    if (!message) {
      res.render("post/postDetails", { post });
    }
    // Find the post
    const post = await Post.findById(req.params.id);

    // create comment
    const comment = await Comment.create({
      user: req.session.userAuth,
      message,
      post: post._id,
    });

    // push the comment to post
    post.comment.push(comment._id);

    // find the user
    const user = await User.findById(req.session.userAuth);
    // push the comment in to user
    user.comments.push(comment._id);
    // disable validation
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
    res.redirect(`/api/v1/posts/${post._id}`);
  } catch (error) {
    res.render("post/postDetails", { error: error.message });
  }
};

const getCommentCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.render("comments/updateComment", {
        comment: "",
        error: "Comment Not Found",
      });
    }
    res.render("comments/updateComment", {
      comment,
      error: "",
    });
  } catch (error) {
    console.log(error);
    res.render("comments/updateComment", {
      comment: "",
      error: error.message,
    });
  }
};

const deleteCommentCtrl = async (req, res, next) => {
  try {
    // find the comment
    const comment = await Comment.findById(req.params.id);
    // check the Comment is belongs to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("you are not allowed to delete this Comment", 403));
    }
    // delete comment
    await Comment.findByIdAndDelete(req.params.id);
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    return next(appErr(error.message));
  }
};
const updateCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    if (!message || message === " ") {
      res.render("posts/updateComment", {
        comment: "",
        error: "Message is Required",
      });
    }
    // find the Comment
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.render("comments/updateComment", {
        comment: "",
        error: "Comment not Found",
      });
    }
    // check the comment is belongs to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      res.render("users/notAuthorize");
    }
    // update post
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message,
      },
      {
        new: true,
      }
    );
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    res.render("comments/updateComment", {
      comment: "",
      error: error.message,
    });
  }
};

module.exports = {
  createCommentCtrl,
  getCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
