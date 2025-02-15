const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.
//Passport-Local Mongoose will automatically add a username, hash and salt field to store the username, the hashed password and the salt value. pbkdf2 hashing algorithm is used by passport.

//User Schema for the user model with email as the unique identifier for the user and password is hashed and salted using passport-local-mongoose package for authentication and authorization of the user.
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpireAt: {
    type: Number,
    default: 0,
  },
  resetOtp: {
    type: String,
    default: "",
  },
  resetOtpExpireAt: {
    type: Number,
    default: 0,
  },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
