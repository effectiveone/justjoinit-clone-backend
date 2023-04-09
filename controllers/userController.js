const passport = require("passport");
const jwt = require("jsonwebtoken");
const authKeys = require("../middleware/authKeys");
const validator = require("validator");

const User = require("../model/User");
const JobApplicant = require("../model/JobApplicant");
const Recruiter = require("../model/Recruiter");

const logger = require("../services/logger");

const sanitizeUserData = (data) => {
  let sanitizedData = {
    email: validator.normalizeEmail(data.email),
    password: validator.escape(data.password),
    type: validator.escape(data.type),
    name: validator.escape(data.name),
  };

  if (data.type === "recruiter") {
    sanitizedData.contactNumber = validator.escape(data.contactNumber);
    sanitizedData.bio = validator.escape(data.bio);
  } else {
    sanitizedData.education = data.education?.map((item) => {
      return {
        institution: validator.escape(item.institution),
        degree: validator.escape(item.degree),
        fieldOfStudy: validator.escape(item.fieldOfStudy),
        startYear: validator.escape(item.startYear),
        endYear: validator.escape(item.endYear),
      };
    });
    sanitizedData.skills = data.skills?.map((skill) => validator.escape(skill));
    sanitizedData.rating = data.rating
      ? validator.escape(data.rating)
      : undefined;
    sanitizedData.resume = data.resume
      ? validator.escape(data.resume)
      : undefined; // Add a check for data.resume
    sanitizedData.profile = data.profile
      ? validator.escape(data.profile)
      : undefined; // Add a check for data.profile
  }

  return sanitizedData;
};

const userController = {
  signup: async (req, res) => {
    console.log("reqbody", req.body);
    const data = sanitizeUserData(req.body);

    // Sprawdź, czy istnieje użytkownik o podanym adresie e-mail
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      // Użytkownik już istnieje, zwróć błąd
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    let user = new User({
      email: data.email,
      password: data.password,
      type: data.type,
    });

    try {
      await user.save();

      const userDetails =
        user.type === "recruiter"
          ? new Recruiter({
              userId: user._id,
              name: data.name,
              contactNumber: data.contactNumber,
              bio: data.bio,
            })
          : new JobApplicant({
              userId: user._id,
              name: data.name,
              education: data.education,
              skills: data.skills,
              rating: data.rating,
              resume: data.resume,
              profile: data.profile,
            });

      await userDetails.save();

      const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        token: token,
        type: user.type,
      });
    } catch (err) {
      logger.error(err);
      res.status(400).json(err);
    }
  },

  login: async (req, res, next) => {
    passport.authenticate(
      "local",
      { session: false },
      async function (err, user, info) {
        if (err) {
          logger.error(err);
          return next(err);
        }
        if (!user) {
          res.status(401).json(info);
          return;
        }

        try {
          const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
          res.json({
            token: token,
            type: user.type,
          });
        } catch (err) {
          logger.error(err);
          res.status(400).json(err);
        }
      }
    )(req, res, next);
  },
};

module.exports = userController;
