const express = require("express");
const multer = require("multer");
const storage = require("../../config/cloudinary");
const {
  registerUserCtrl,
  loginUserCtrl,
  userDetailsCtrl,
  userProfileCtrl,
  userProfilePhotoUploadCtrl,
  userCoverPhotoUploadCtrl,
  userUpdatePasswordCtrl,
  updateUserCtrl,
  userLogoutCtrl,
} = require("../../controllers/users/users");
const protected = require("../../middlewares/protected");

const userRoutes = express.Router();

// instance of multer
const upload = multer({ storage });

//-------
//Rendering forms
//-------

// login form
userRoutes.get("/login", (req, res) => {
  res.render("users/login", {
    error: "",
  });
});

// register form
userRoutes.get("/register", (req, res) => {
  res.render("users/register", {
    error: "",
  });
});

// upload profile photo template
userRoutes.get("/upload-profile-photo-form", (req, res) => {
  res.render("users/uploadProfilePhoto", {
    error: "",
  });
});

// upload cover photo template
userRoutes.get("/upload-cover-photo-form", (req, res) => {
  res.render("users/uploadCoverPhoto", {
    error: "",
  });
});

// update user form
userRoutes.get("/update-password-form", (req, res) => {
  res.render("users/updatePassword", {
    error: "",
  });
});

// POST/api/v1/users/register
userRoutes.post("/register", upload.single("profile"), registerUserCtrl);

// POST/api/v1/users/login
userRoutes.post("/login", loginUserCtrl);

// GET/api/v1/users/profile-page
userRoutes.get("/profile-page", protected, userProfileCtrl);

// PUT/api/v1/users/profile-photo-upload/:id
userRoutes.put(
  "/profile-photo-upload/",
  protected,
  upload.single("profile"),
  userProfilePhotoUploadCtrl
);

// PUT/api/v1/users/profile-cover-upload/:id
userRoutes.put(
  "/cover-photo-upload/",
  protected,
  upload.single("cover"),
  userCoverPhotoUploadCtrl
);

// PUT/api/v1/users/update-password/:id
userRoutes.put("/update-password", userUpdatePasswordCtrl);

// PUT/api/v1/users/update
userRoutes.put("/update", updateUserCtrl);

// GET/api/v1/users/logout/:id
userRoutes.get("/logout", userLogoutCtrl);

// GET/api/v1/users/:id
userRoutes.get("/:id", userDetailsCtrl);

module.exports = userRoutes;
