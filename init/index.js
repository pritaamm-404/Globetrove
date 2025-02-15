const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main()
  .then(() => {
    console.log("Connection successful to DB!!!!!");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "678c1511e810336246eed2fc",
  })); //Map Creates a new array with owner property
  await Listing.insertMany(initData.data);
  console.log("Data initialized");
};

initDB();
