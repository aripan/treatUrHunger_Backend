let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");

let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users");
let dishRouter = require("./routes/dishRouter");
let leaderRouter = require("./routes/leaderRouter");
let promoRouter = require("./routes/promoRouter");

// Importing mongoose
const mongoose = require("mongoose");

// Importing model
const Dishes = require("./models/dishes");
const Leaders = require("./models/leaders");
const Promotions = require("./models/promotions");

// Connecting MongoDB
const url =
  "mongodb+srv://Asad123:Asad123@rescluster.kfqqb.mongodb.net/test?retryWrites=true&w=majority";

const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Error Handling for the DB
connect.then(
  () => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//! NEED TO USE AUTHENTICATION HERE

function auth(req, res, next) {
  console.log(req.headers);

  let authHeader = req.headers.authorization;

  // Checking the authorization of the user
  if (!authHeader) {
    let err = new Error("Sorry, but you are not authenticated!");

    res.setHeader("WWW-Authenticate", "Basic");
    err.status = 401;
    return next(err);
  } else {
    // authHeader exists, so now we will split it
    let auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");

    // Assigning the username and password
    let username = auth[0];
    let password = auth[1];

    // Checking the username & password
    if (username == "admin" && password == "password") {
      next();
    } else {
      let err = new Error("Sorry, but you are not authenticated!");

      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      return next(err);
    }
  }
}
app.use(auth);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
