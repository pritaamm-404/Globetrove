const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

//MVC Design implementation.....
const userController = require("../controllers/user");
const user = require("../models/user");

//Render Sign up form for users..... & Sign up post requrest............(combined)

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

//Login form route & Passport provides an authenticate() function, which is used as route middleware to authenticate requests.
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login", //if authentication fails then redirects to login page again
      failureFlash: true,
    }),
    userController.login // Handle post-login redirection; Redirect after successful login
  );

//LogOut Route..............
router.get("/logout", userController.logout);

//Send Password Reset OTP Route.....................................................................
router.route("/send-reset-otp", userController.sendPasswordResetOtp);

//Reset Password Route.............
router.route("/reset-password", userController.resetPassword);

module.exports = router;
