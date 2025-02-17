if (process.env.NODE_ENV != "production") {
  //If the environment is not production, then load the environment variables from the .env file using the dotenv package (npm package) and the config method of the dotenv package to load the environment variables from the .env file
  require("dotenv").config();
}
//Project Name: A treasure trove of stays for global travelers - Globetrove

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate"); //For EJS rendering engine (EJS is a template engine that lets you generate HTML markup with plain JavaScript)
app.use(express.urlencoded({ extended: true })); //For parsing the form data

const ExpressError = require("./utils/ExpressError.js"); //For error handling, custom made error class

const path = require("path"); //For EJS rendering
const methodOverride = require("method-override"); //Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
const { date } = require("joi");

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

app.set("view engine", "ejs"); //For EJS rendering app.set("view engine", "ejs") sets the view engine to EJS to render the views in the views folder in the project directory (app/views)

app.set("views", path.join(__dirname, "views")); //For EJS rendering path.join(__dirname, "views") is the path to the views folder in the project directory (app/views)

app.use(express.static(path.join(__dirname, "/public"))); //For serving static files to the client that are in the public folder in the project directory
app.engine("ejs", ejsMate); //For EJS rendering

const session = require("express-session"); //Express-session is a middleware that stores the session data in the session store and creates a session object req.session for each request
const flash = require("connect-flash"); //Connect-flash is a middleware that allows you to store messages in the session and retrieve them to display in the view
const MongoStore = require("connect-mongo");

const passport = require("passport"); //Passport is Express-compatible authentication middleware for Node.js.
const LocalStrategy = require("passport-local"); //Passport strategy for authenticating with a username and password.
const User = require("./models/user.js"); //Users Schema access
const Listing = require("./models/listing.js"); //Listing Schema access

const listingRouter = require("./routes/listing.js"); // Ensure the correct path to the listing router
const reviewRouter = require("./routes/review.js"); // Ensure the correct path to the reviews router
const userRouter = require("./routes/user.js"); // Ensure the correct path to the user router

//MONGODB URL = "mongodb://127.0.0.1:27017/wanderlust"

main()
  .then(() => {
    console.log("Connection successful to DB!!!!!");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
}
// console.log("Mapbox Token from .env:-", process.env.MAP_TOKEN);

// mongoose
//   .connect(process.env.ATLASDB_URL, {})
//   .then(async () => {
//     const listings = await Listing.find({});
//     console.log(listings); // This should print your listings with coordinates
//     mongoose.connection.close();
//   })
//   .catch((err) => console.log(err));

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET_CODE,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in ATLAS MONGO_STORE");
});

//Middleware for session and flash messages using connect-flash npm package and express-session npm package to store the session data in the session store
const sessionOptions = {
  store,
  secret: process.env.SECRET_CODE,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());

//ROUTES............................
app.get("/", (req, res) => {
  res.redirect("/listings");
});

//To use Passport in an Express or Connect-based application, configure it with the required passport.initialize() middleware. If your application uses persistent login sessions, passport.session() middleware must also be used.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //using static authenticate method of model in LocalStrategy

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware for connect-flash npm package to show flash msges!
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  // console.log("Incoming Request:", req.method, req.url); //Debugging
  next();
});

app.use((req, res, next) => {
  res.locals.MAPBOX_TOKEN = process.env.MAP_TOKEN; // ✅ Ensure this is set globally
  next();
});

//We are using Express-Router method to define the Routers.............

//For all the routes starting with /listings, use the listingRouter
app.use("/listings", listingRouter);
//For all the routes starting with /listings/:id/reviews, use the reviewRouter
app.use("/listings/:id/reviews", reviewRouter);
//For all the routes starting with /, use the userRouter
app.use("/", userRouter);

//For all the else cases....
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

//Custom middleware to handle errors in the app
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Somthing went wrong, go back!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

//Port
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
