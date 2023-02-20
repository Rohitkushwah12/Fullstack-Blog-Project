const bcrypt = require("bcryptjs");
const { findByIdAndUpdate } = require("../../model/user/user");
const User = require("../../model/user/user");
const appErr = require("../../utils/appErr");

const registerUserCtrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  //check empty fields
  if (!fullname || !email || !password) {
    return res.render("users/register", {
      error: "All fields are required",
    });
  }
  try {
    // 1. check user exist (email)
    const userFound = await User.findOne({ email });
    if (userFound) {
      // throw an error
      return res.render("users/register", {
        error: "User Already Exist",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);
    // register user
    const user = await User.create({
      fullname,
      email,
      password: passwordHashed,
    });
    // redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.json(error);
  }
};

const loginUserCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  //check empty fields
  if (!email || !password) {
    return next(appErr("email and password fields are required"));
  }
  try {
    // check email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      // throw an error
      return res.render("users/login", {
        error: "invalid login credentials",
      });
    }

    // check password valid
    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) {
      // throw an error
      return res.render("users/login", {
        error: "invalid login credentials",
      });
    }
    // save the user into session
    req.session.userAuth = userFound._id;
    // redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.json(error);
  }
};

const userDetailsCtrl = async (req, res) => {
  try {
    // get the id from the params
    const userId = req.params.id;
    // find the user
    const user = await User.findById(userId);
    res.render("users/updateUser", {
      user,
      error: "",
    });
  } catch (error) {
    res.json(error);
  }
};

const userProfileCtrl = async (req, res) => {
  try {
    // get the login user
    const userID = req.session.userAuth;
    // find the user
    const user = await User.findById(userID)
      .populate("posts")
      .populate("comments");
    res.render("users/profile", { user });
  } catch (error) {
    res.json(error);
  }
};

const userProfilePhotoUploadCtrl = async (req, res, next) => {
  try {
    // check file contains or not
    if (!req.file) {
      res.render("users/uploadProfilePhoto", {
        error: "Please Upload an Image",
      });
    }
    // 1. Find the user to be updated
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);

    // 2. check if user is not found
    if (!userFound) {
      res.render("users/uploadProfilePhoto", {
        error: "User Not Found",
      });
    }

    //3. Update the profile photo
    await User.findByIdAndUpdate(
      userId,
      {
        profileImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.render("users/uploadProfilePhoto", {
      error: error.message,
    });
  }
};

const userCoverPhotoUploadCtrl = async (req, res) => {
  try {
    // check file contains or not
    if (!req.file) {
      res.render("users/uploadCoverPhoto", {
        error: "Please Upload an Image",
      });
    }
    // 1. Find the user to be updated
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);

    // 2. check if user is not found
    if (!userFound) {
      res.render("users/uploadCoverPhoto", {
        error: "User Not Found",
      });
    }

    //3. Update the profile photo
    await User.findByIdAndUpdate(
      userId,
      {
        coverImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.render("users/uploadCoverPhoto", {
      error: error.message,
    });
  }
};

const userUpdatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHashed = await bcrypt.hash(password, salt);
      // update user
      const user = await User.findByIdAndUpdate(
        req.session.userAuth,
        {
          password: passwordHashed,
        },
        {
          new: true,
        }
      );
      res.redirect("/api/v1/users/profile-page");
    } else {
      res.render("users/updatePassword", {
        error: "Please Provide Password Field",
      });
    }
  } catch (error) {
    res.render("users/updatePassword", {
      error: error.message,
    });
  }
};

const updateUserCtrl = async (req, res, next) => {
  const { fullname, email } = req.body;
  try {
    //check empty fields
    if (!fullname || !email) {
      res.render("users/updateUser", {
        user: "",
        error: "All fields are required",
      });
    }
    // check email is taken
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      res.render("users/updateUser", {
        user: "",
        error: "Email already Exist",
      });
    }

    // update the user
    await User.findByIdAndUpdate(
      req.session.userAuth,
      {
        fullname,
        email,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.render("users/updateUser", {
      user: "",
      error: error.message,
    });
  }
};

const userLogoutCtrl = async (req, res) => {
  // destroy session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};
module.exports = {
  registerUserCtrl,
  loginUserCtrl,
  userDetailsCtrl,
  userProfileCtrl,
  userProfilePhotoUploadCtrl,
  userCoverPhotoUploadCtrl,
  userUpdatePasswordCtrl,
  updateUserCtrl,
  userLogoutCtrl,
};
