const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //Mapbox Geocoding API access for converting address to coordinates and vice-versa, using the mapbox-sdk package(Github), which is a Node.js client for Mapbox web services.
const mapToken = process.env.MAP_TOKEN; //Mapbox token for accessing the Mapbox API
const geocodingClient = mbxGeocoding({ accessToken: mapToken }); //Creating a new client for the Mapbox Geocoding API using the mapToken

//INDEX ROUTE.....................................

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  // console.log(allListings);
  res.render("listings/index.ejs", { allListings });
};

//NEW ROUTE.......................................

module.exports.renderNewForm = (req, res) => {
  //passing the middleware isLoggedIn to check user's authentication
  res.render("listings/new.ejs");
};

//SHOW ROUTE......................................
module.exports.showListings = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner"); //Populating the reviews field in the listing model with the reviews data from the review model

  // Validating the listing id to check if it exists or not so that no one can access the invalid listing id through the URL or Hopscotch API
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist.");
    res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", {
    listing,
    mapToken: process.env.MAP_TOKEN, // ✅ Pass the token properly
  });
};

//Show filtered Listings based on the category................................................
module.exports.showCategoryListings = async (req, res) => {
  // const { category } = req.query; // Extract category from query string
  // console.log("Category Filter:", category); // Debugging: Check the received category
  // console.log("Received Query:", req.query); // Debugging
  // let listings;

  // if (category) {
  //   listings = await Listing.find({ category }); // Filter by category
  //   console.log("Filtered Listings:", listings); // Debugging: Ensure query works as expected
  // } else {
  //   listings = await Listing.find({}); // Fetch all listings
  // }

  // res.render("listings/index.ejs", { allListings: listings, category });

  const { category } = req.query;
  console.log("Incoming Query:", req.query); // Logs: { category: 'Trending' }
  console.log("Database Query:", query); // Logs: { category: 'Trending' }

  try {
    const query = category ? { category } : {}; // Filter by category if provided
    const allListings = await Listing.find(query); // Fetch filtered listings
    console.log("Filtered Listings:", allListings); // Logs the listings retrieved

    res.render("listings/index.ejs", { allListings, category });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("Server error");
  }
};

//CREATE ROUTE....................................

module.exports.createListings = async (req, res, next) => {
  let response = await geocodingClient //Using the geocodingClient to get the coordinates of the location provided in the listing form
    .forwardGeocode({
      query: req.body.listing.location, //Querying the location field in the listing form to get the coordinates
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const listing = req.body.listing;
  const newListing = new Listing(listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  //Setting the geometry field in the listing model to the coordinates obtained from the Mapbox Geocoding API
  // newListing.geometry = response.body.features[0].geometry;
  newListing.geometry = response.body.features[0]?.geometry || {
    type: "Point",
    coordinates: [0, 0],
  }; //This ensures that even if Mapbox fails to provide a result, the geometry field is initialized with a default value.

  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "Successfully created a new listing!"); //Using connect-flash middleware with the name success...
  res.redirect(`/listings/${newListing._id}`);
};

//EDIT ROUTE......................................

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist.");
    res.redirect("/listings");
  }

  //To give a preview of the listing_pic to the Listing_owner at time of editing.....
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//UPDATE ROUTE....................................

module.exports.updateListings = async (req, res) => {
  if (!req.body.listing)
    throw new ExpressError(400, "Invalid Listing Data, send valid one!"); //Checking if the listing data is valid
  let { id } = req.params;
  // let listing = req.body.listing;
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    new: true,
  });

  if (typeof req.file !== "undefined") {
    //typeof, in JS, checks if any variable returns undefined or not.
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save(); //have to save again after await Listing.findByIdAndUpdate as we update the image again
  }
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`); //redirecting to the show page
};

//DELETE ROUTE....................................

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
