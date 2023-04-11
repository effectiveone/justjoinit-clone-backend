const sinon = require("sinon");
const Rating = require("../model/Rating");
const { getPersonalRating } = require("./ratingController");

describe("ratingController", () => {
  afterEach(() => {
    sinon.restore();
  });

  test.only("getPersonalRating: returns a personal rating", async () => {
    // Mock data
    const req = {
      user: { _id: "123", type: "recruiter" },
      query: { id: "456" },
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    // Mock Rating.findOne
    sinon.stub(Rating, "findOne").resolves({ rating: 4 });

    // Call the function
    await getPersonalRating(req, res);

    // Assertions
    expect(res.status.calledWith(400)).toBe(false);
    expect(res.json.calledWith({ rating: 4 })).toBe(true);
  });
});
