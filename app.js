const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const passport = require("passport"); // at header
require("./config/passport");

const app = express();

//Parsing postReq data to JSON
app.use(express.json());
app.use(passport.initialize());

//To pass CORS origin policy..which helps to run React and Node separately on diff. hosts
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

//Routes
app.use("/api", authRoutes);

//For any unknown API request
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});

//Setting up database and backend Server
mongoose
  .connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-shard-00-00.kyz02.mongodb.net:27017,cluster0-shard-00-01.kyz02.mongodb.net:27017,cluster0-shard-00-02.kyz02.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-72j8yq-shard-0&authSource=admin&retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`MongoDB Connected and Connection started at 8000`);
      console.log("Local -> http://localhost:8000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
