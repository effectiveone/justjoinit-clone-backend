const request = require("supertest");
const createApp = require("../server");
const app = createApp();
const User = require("../model/User");
const logger = require("../services/logger");

// Clean up the database before each test
beforeEach(async () => {
  await User.deleteMany({
    email: { $in: ["newsertest@example.com", "nexttest@example.com"] },
  });
});

describe("User controller tests", () => {
  describe("signup", () => {
    beforeEach(() => {
      jest.spyOn(logger, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should handle errors during signup", async () => {
      jest.setTimeout(10000);
      const user = {
        email: "newsertest@example.com",
        password: "testpassword",
        type: "invalidType",
        name: "John Doe",
      };

      const response = await request(app)
        .post("/auth/signup")
        .send(user)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      // Create and save a user to the database
      const user = new User({
        email: "newsertest@example.com",
        password: "testpassword",
        type: "applicant",
      });

      await user.save();
    });

    it("should handle invalid login credentials", async () => {
      const user = {
        email: "newsertest@example.com",
        password: "wrongpassword",
        type: "applicant",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(user)
        .expect(401);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Password is incorrect.");
    });

    it("should handle errors during login", async () => {
      const user = {
        email: "nexttest@example.com",
        password: "testpassword",
        type: "applicant",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(user)
        .expect(401);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("User does not exist");
    });
  });
});
