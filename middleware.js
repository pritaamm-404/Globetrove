const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js"); //For error handling custom made error class
const { listingSchema, reviewSchema } = require("./schema.js"); //For Joi validation schema

//Validation Schema MIDDLEWARE...........
//Middleware to validate the listing data
module.exports.validateListing = (req, res, next) => {
  console.log("Request body in validateListing:", req.body);
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); //Checking if the listing data is valid using Joi
  } else {
    next();
  }
};

//Middleware to validate the review data
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); //Checking if the review data is valid using Joi
  } else {
    next();
  }
};  

module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.user);
  if (!req.isAuthenticated()) { //To check if user is logged in or not?
    req.session.redirectUrl = req.originalUrl; //when user goes to some_path->then site says Login-> site redirects to the same path again to user's convenience, checks at the time of login
    console.log("Saved redirect URL:", req.session.redirectUrl); // Debugging
    req.flash("error", "You must be logged in first to access the features!");
    return res.redirect("/login");
  }
  next(); //Next() method is compulsory for every method as it is middleware
};

//
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  // if (req.method === "GET" && !req.session.redirectUrl) { 
  //   req.session.redirectUrl = req.originalUrl; // Only save for GET requests
  //   console.log("Saved redirect URL:", req.session.redirectUrl); // Debugging
  // }

  next();//Next() method is compulsory for every method as it is middleware
};

module.exports.isOwner = async (req, res, next) => {
  console.log("Current user:", res.locals.currUser);
  const { id } = req.params;
  let findListing = await Listing.findById(id);
  if (!findListing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to make changes here since only Owner is allowed to do so!");
    return res.redirect(`/listings/${id}`);
  }
  next();//Next() method is compulsory for every method as it is middleware

};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let findReview = await Review.findById(reviewId);
  if (!findReview.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to make changes here since you aren't the author of the review!");
    return res.redirect(`/listings/${id}`);
  }
  next();//Next() method is compulsory for every method as it is middleware

};
