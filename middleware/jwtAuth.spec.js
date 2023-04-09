const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwtAuth = require("./jwtAuth");

const app = express();
app.use(express.json());
app.use(passport.initialize());

const authKeys = require("../middleware/authKeys");
const testUser = { id: 1, username: "testuser" };

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: authKeys.jwtSecretKey,
};

passport.use(
  "jwt", // Zmień nazwę strategii na "jwt".
  new JwtStrategy(opts, (jwt_payload, done) => {
    if (jwt_payload.sub === testUser.id) {
      return done(null, testUser);
    } else {
      return done(null, false, { message: "Invalid user ID" });
    }
  })
);

app.get("/protected", jwtAuth, (req, res) => {
  res.status(200).json({ message: "Access granted", user: req.user });
});

describe("jwtAuth middleware", () => {
  test("Missing authorization header", async () => {
    const response = await request(app).get("/protected");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Missing authorization header");
  });

  test("Invalid token", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalidToken");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
  });

  test("Valid token", async () => {
    const token = jwt.sign({ sub: testUser.id }, authKeys.jwtSecretKey, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Access granted");
    expect(response.body.user).toEqual(testUser);
  });

  test("Invalid user ID", async () => {
    const token = jwt.sign({ sub: 999 }, authKeys.jwtSecretKey, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid user ID");
  });
});
