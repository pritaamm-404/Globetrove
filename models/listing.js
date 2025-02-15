const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: [
      "Trending",
      "Beachfront",
      "Top City",
      "Mountains",
      "Arctics",
      "Castle",
      "Amazing Pool",
      "Farms",
    ],
  },
  image: {
    filename: String,
    url: String,
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    //Mongoose GeoJSON data for the location of the listing to be stored in the database
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

// Mongoose Middleware to delete all reviews associated with a listing when the listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  //Post middleware that runs after a listing is deleted
  if (listing) {
    await Review.deleteMany({
      _id: {
        $in: listing.reviews, //Delete all reviews that have an id that is in the reviews array of the listing
      },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
