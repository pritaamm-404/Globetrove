const express = require("express");
const router = express.Router(); //
const Listing = require("../models/listing.js"); //For the Listing model
const wrapAsync = require("../utils/wrapAsync.js"); //For error handling
const {
  isLoggedIn,
  isOwner,
  validateListing,
  saveRedirectUrl,
} = require("../middleware.js");
const { storage } = require("../cloudConfig.js"); //For cloudinary storage

//implementing MVC design pattern---> Model, View, Controller
const listingController = require("../controllers/listing.js");

//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
const multer = require("multer");
const upload = multer({ storage }); //Storing the uploaded files in the Cloudinary storage

//Returns an instance of a single route which you can then use to handle HTTP verbs with optional middleware. Implementing Router.route() to avoid duplicate route naming and thus typing errors.
//INDEX ROUTE & CREATE ROUTE.................................................
router
  .route("/")
  .get(wrapAsync(listingController.index)) // fetching the call-back funx from ../controllers/listing.js
  .get(wrapAsync(listingController.showCategoryListings))
  .post(
    isLoggedIn,
    upload.single("listing[image]"), // multer processes the form and populates req.body
    validateListing,
    wrapAsync(listingController.createListings)
  );

//NEW ROUTE.......................................
router.get("/new", isLoggedIn, listingController.renderNewForm);

//SHOW ROUTE & UPDATE ROUTE & DELETE ROUTE.....................................

router
  .route("/:id")
  .get(wrapAsync(listingController.showListings))
  .put(
    saveRedirectUrl,
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListings)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//EDIT_FORM ROUTE.................
router.get(
  "/:id/edit",
  saveRedirectUrl,
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);
module.exports = router;
