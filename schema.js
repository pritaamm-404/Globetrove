const Joi = require("joi"); // Joi is a schema validator library that can be used to validate the data that is being sent to the server.

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .valid(
        "Trending",
        "Beachfront",
        "Top City",
        "Mountains",
        "Arctics",
        "Castle",
        "Amazing Pool",
        "Farms"
      )
      .required(),
    image: Joi.string().allow("", null),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
}); // This is the schema that we will use to validate the data that is being sent to the server. It is an object that contains a listing object that has a title, description, image, price, location, and country. Each of these properties has a Joi validation method that specifies the type of data that is expected and any additional constraints that should be applied to the data. The listing object is required, and each of its properties is also required. The price property has a minimum value of 99. This schema will be used to validate the data that is being sent to the server when creating or updating a listing.

// This is the schema that we will use to validate the data that is being sent to the server. It is an object that contains a review object that has a rating and a comment. Each of these properties has a Joi validation method that specifies the type of data that is expected and any additional constraints that should be applied to the data. The review object is required, and each of its properties is also required. The rating property has a minimum value of 1 and a maximum value of 5. This schema will be used to validate the data that is being sent to the server when creating a review.
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
