const User = require("../model/User");
const Recruiter = require("../model/Recruiter");
const JobApplicant = require("../model/JobApplicant");
const validator = require("validator");
const logger = require("../services/logger");
const rateLimit = require("express-rate-limit");

const getUserType = (user) =>
  user.type === "recruiter" ? Recruiter : JobApplicant;

const handleNotFound = (res) => {
  const message = "User does not exist";
  logger.warn(`404 - ${message}`);
  res.status(404).json({
    message: message,
  });
};

const handleError = (res, err) => {
  logger.error(`400 - ${err.message}`);
  res.status(400).json(err);
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

const recruiterController = {
  getCurrentUser: [
    limiter,
    (req, res) => {
      logger.info("Getting current user");
      const user = req.user;
      const UserType = getUserType(user);

      UserType.findOne({ userId: user._id })
        .then((result) => {
          if (result == null) {
            handleNotFound(res);
            return;
          }
          res.json(result);
        })
        .catch((err) => {
          handleError(res, err);
        });
    },
  ],
  getUserDetails: [
    limiter,
    (req, res) => {
      logger.info("Getting user details");
      const sanitizedId = validator.escape(req.params.id);

      User.findOne({ _id: sanitizedId })
        .then((userData) => {
          if (userData === null) {
            handleNotFound(res);
            return;
          }

          const UserType = getUserType(userData);

          UserType.findOne({ userId: userData._id })
            .then((result) => {
              if (result === null) {
                handleNotFound(res);
                return;
              }
              res.json(result);
            })
            .catch((err) => {
              handleError(res, err);
            });
        })
        .catch((err) => {
          handleError(res, err);
        });
    },
  ],
  updateUserDetails: [
    limiter,
    (req, res) => {
      logger.info("Updating user details");
      const user = req.user;
      const data = req.body;
      const UserType = getUserType(user);

      UserType.findOne({ userId: user._id })
        .then((result) => {
          if (result == null) {
            handleNotFound(res);
            return;
          }

          for (const key in data) {
            if (data.hasOwnProperty(key) && result[key] !== undefined) {
              result[key] = Array.isArray(data[key])
                ? data[key].map((item) => validator.escape(item))
                : validator.escape(data[key]);
            }
          }

          result
            .save()
            .then(() => {
              res.json({
                message: "User information updated successfully",
              });
            })
            .catch((err) => {
              handleError(res, err);
            });
        })
        .catch((err) => {
          handleError(res, err);
        });
    },
  ],
};

module.exports = recruiterController;
