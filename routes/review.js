const express = require("express");
const router = express.Router({ mergeParams: true }); // Merge params from parent router, ensures that the id parameter from the parent router is available in the child routes.
const wrapAsync = require("../utils/wrapAsync.js"); //For error handling
const ExpressError = require("../utils/ExpressError.js"); //For error handling, custom made error class
const { listingSchema, reviewSchema } = require("../schema.js"); //For Joi validation schema
const Review = require("../models/review.js"); //For the Review model
const Listing = require("../models/listing.js"); // Import the Listing model
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

const reviewController = require("../controllers/review.js");

//Review Routes...............................................
//POST Route for creating a review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

//DELETE Route for deleting a review......................................
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
