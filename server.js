const express = require("express");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passportConfig = require("./lib/passportConfig");
const fs = require("fs");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const logger = require("./services/logger");

const port = 4444;

function createApp() {
  const app = express();

  // MongoDB
  mongoose
    .connect("mongodb://localhost:27017/jobPortal", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then((res) => console.log("Connected to DB"))
    .catch((err) => console.log(err));

  // Initialise directories
  const directories = ["./public", "./public/resume", "./public/profile"];
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

  // Set up helmet middleware for HTTP header protection
  app.use(helmet());

  // Set up CORS middleware to allow cross-origin resource sharing
  app.use(cors());

  // Set up body-parser middleware for parsing request bodies
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Set up rate limiting middleware to prevent brute force attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later",
  });
  app.use(limiter);

  // Set up mongoSanitize middleware to prevent NoSQL injection attacks
  app.use(mongoSanitize());

  // Set up xss middleware to prevent cross-site scripting attacks
  app.use(xssClean());

  // Set up sql middleware to prevent SQL injection attacks
  app.use(hpp());

  // Setting up middlewares
  app.use(express.json());
  app.use(passportConfig.initialize());

  // Set up routes
  app.use("/auth", authRoutes);
  app.use("/api", apiRoutes);
  app.use("/upload", uploadRoutes);
  app.use("/host", downloadRoutes);

  // Logging middleware
  app.use(morgan("dev"));

  // Handle 404 errors
  app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
  });

  // Handle other errors
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send({ error: "Internal Server Error" });
  });

  return app;
}

module.exports = createApp;

// Start server
const app = createApp();

app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
