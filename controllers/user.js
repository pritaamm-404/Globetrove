const { text } = require("express");
const User = require("../models/user"); // Import the User model
const transporter = require("../utils/nodemailer"); // Import the nodemailer transporter

//Render Sign up form for users..............
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

//Sign Up route ...........................................
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password); //register(user, password, callBack) ,Convenience method to register a new user instance with a given password. Checks if username is unique.

    console.log(registeredUser);
    req.login(registeredUser, async (err) => {
      // login(user, options, callback) ,Passport exposes a login() function on req (also aliased as logIn()) that can be used to establish a login session. When the login operation completes, user will be assigned to req.user.
      if (err) {
        return next(err);
      }
      // send mail with defined transport object to the user who signed up
      const mailOptions = {
        from: process.env.SENDER_EMAIL, // sender address
        to: email, // list of receivers
        subject: "Welcome to Globetrove", // Subject line
        html: `<b>Welcome to the world of WanderLust's, ${username}!!!<br>A treasure trove of stays for global travelers.</b><br>Your account has been created successfully with the email id: ${email}.<br>Hope to have a great journey with you ahead!!`, // html body
      };
      await transporter.sendMail(mailOptions);
      req.flash(
        "success",
        `Welcome to the world of Globetrove's, ${username}!!! `
      );
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

//Render login form route ..........
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

//Passport provides an authenticate() function, which is used as route middleware to authenticate requests....
//login helping route.....
module.exports.login = async (req, res) => {
  // console.log("Redirect URL in session:", req.session.redirectUrl); // Debugging
  req.flash("success", "Welcome back to the world of Globetrove's!");
  let redirectUrl = res.locals.redirectUrl || "/listings"; //original code

  // Use the session-stored redirect URL if it exists; otherwise, default to "/listings".
  // let redirectUrl = req.session.redirectUrl || "/listings";
  // delete req.session.redirectUrl; // Clear the redirect URL after using it. ensures that subsequent logins do not unintentionally redirect to a previously saved URL.
  // let redirectUrl = req.session.redirectUrl || "/listings";
  // delete req.session.redirectUrl; // Clear the URL after redirecting

  console.log("Redirecting to:", redirectUrl); // Debugging
  res.redirect(redirectUrl);
};

//Log Out helping route..............
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You're successfully logged out!");
    res.redirect("/listings");
  });
};

//NEW CODE FOR PASSWORD RESET FUNCTIONALITY.................................................

//Send Password reset otp to the user's email.............
module.exports.sendPasswordResetOtp = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    req.flash("error", "Please enter a valid username!");
    // return res.redirect("/forgot-password");
  }
  try {
    const email = await User.findOne({ username });
    if (!email) {
      req.flash("error", "No email address is associated with the user!");
      // return res.redirect("/forgot-password");
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    username.resetOtp = otp;
    username.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await username.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: username.email,
      subject: "Password Reset OTP",
      html: `<b>Your OTP to reset the password is ${otp}</b><br><b>This OTP is valid for 15 minutes only.</b><br>Do not share this OTP with anyone!<br>Use this OTP to reset your password on Globetrove's website.<br>Regards, Globetrove's Team`,
    };
    await transporter.sendMail(mailOptions);
    req.flash("success", "An OTP has been sent to your email address!");
    // res.redirect(`/reset-password/${email}`);
  } catch (error) {
    req.flash("error", error.message);
  }
};

//Reset Password route.............
module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    req.flash("error", "Please enter all the fields!");
    // return res.redirect(`/reset-password/${email}`);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No user found with that email address!");
      // return res.redirect(`/reset-password/${email}`);
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      req.flash("error", "Invalid OTP entered!");
      // return res.redirect(`/reset-password/${email}`);
    }
    if (user.resetOtpExpireAt < Date.now()) {
      req.flash("error", "OTP has expired! Please try again.");
      // return res.redirect(`/reset-password/${email}`);
    }
    const updatedUser = await user.setPassword(newPassword);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await updatedUser.save();
    req.flash("success", "Password reset successfully!");
  } catch (error) {
    req.flash("error", error.message);
  }
};
