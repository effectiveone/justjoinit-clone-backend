const passport = require("passport");
const jwt = require("jsonwebtoken");
const authKeys = require("../middleware/authKeys");

const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  jwt.verify(token, authKeys.jwtSecretKey, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    passport.authenticate(
      "jwt", // Zmień nazwę strategii na "jwt"
      { session: false },
      function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          res.status(401).json(info);
          return;
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  });
};

module.exports = jwtAuth;
