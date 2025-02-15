const Review = require("../models/review");// Import the review model
const Listing = require("../models/listing");// Import the Listing model

//Review Routes...............................................
//POST Route for creating a review

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    console.log(`Listing not found for ID: ${id}`); //
    throw new ExpressError(404, "Listing not found");
  }
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  // console.log(newReview);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  console.log("New Review Created: ", newReview);
  req.flash("success", "Review added!");
  res.redirect(`/listings/${id}`);
};

//DESTROY Route for deleting a review......................................

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  console.log(`DELETE /reviews/${reviewId} - Listing ID: ${id}`);

  const listing = await Listing.findById(id);
  if (!listing) {
    console.log(`Listing not found for ID: ${id}`);
    throw new ExpressError(404, "Listing not found");
  }
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //Removing the review from the listing model using $pull operator of MongoDB that removes the reviewId from the reviews array
  await Review.findByIdAndDelete(reviewId); //Triggers the post middleware in the listing model that deletes the review from the review model
  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
