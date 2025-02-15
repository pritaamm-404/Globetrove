const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Listing = require("./models/listing");

const mapboxClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  console.log("Database connected");

  try {
    // Find listings without geometry
    const listings = await Listing.find({ geometry: { $exists: false } });

    if (listings.length === 0) {
      console.log("No listings found with missing geometry.");
      return;
    }

    console.log(`Found ${listings.length} listings to update.`);

    for (const listing of listings) {
      if (!listing.location) {
        console.error(`Listing ${listing._id} is missing a location. Skipping.`);
        continue;
      }

      console.log(`Processing listing: ${listing.title}, Location: ${listing.location}`);

      try {
        const response = await mapboxClient
          .forwardGeocode({
            query: listing.location,
            limit: 1,
          })
          .send();

        if (response.body.features && response.body.features.length > 0) {
          listing.geometry = {
            type: "Point",
            coordinates: response.body.features[0].center,
          };
          await listing.save();
          console.log(`Updated geometry for: ${listing.title}`);
        } else {
          console.error(`No geocoding results for location: ${listing.location}`);
        }
      } catch (err) {
        console.error(`Error geocoding listing ${listing.title}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error fetching listings: ${err.message}`);
  } finally {
    mongoose.connection.close();
  }
});
