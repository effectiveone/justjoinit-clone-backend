const Rating = require("../model/Rating");
const JobApplicant = require("../model/JobApplicant");
const Application = require("../model/Application");
const Job = require("../model/Job");
const mongoose = require("mongoose");
const validator = require("validator");

const ratingController = {
  updateOrCreateRating: async (req, res) => {
    const user = req.user;
    const data = req.body;
    const category = user.type === "recruiter" ? "applicant" : "job";
    const idField = category === "applicant" ? "applicantId" : "jobId";
    const Model = category === "applicant" ? JobApplicant : Job;

    // Clean data
    data[idField] = validator.escape(data[idField]);
    data.rating = parseFloat(validator.escape(data.rating));

    try {
      const rating = await Rating.findOne({
        senderId: user._id,
        receiverId: data[idField],
        category,
      });

      const applicationCount = await Application.countDocuments({
        userId: user._id,
        [idField]: data[idField],
        status: { $in: ["accepted", "finished"] },
      });

      if (applicationCount === 0) {
        return res.status(400).json({
          message: `You haven't worked with this ${category}. Hence you cannot give a rating.`,
        });
      }

      if (rating) {
        rating.rating = data.rating;
        await rating.save();
      } else {
        await new Rating({
          category,
          receiverId: data[idField],
          senderId: user._id,
          rating: data.rating,
        }).save();
      }

      const [{ average }] = await Rating.aggregate([
        {
          $match: {
            receiverId: mongoose.Types.ObjectId(data[idField]),
            category,
          },
        },
        {
          $group: {
            _id: {},
            average: { $avg: "$rating" },
          },
        },
      ]);

      await Model.findOneAndUpdate(
        { userId: data[idField] },
        { $set: { rating: average } }
      );

      res.json({
        message: `Rating ${rating ? "updated" : "added"} successfully`,
      });
    } catch (err) {
      res.status(400).json(err);
    }
  },

  getPersonalRating: async (req, res) => {
    const user = req.user;
    const category = user.type === "recruiter" ? "applicant" : "job";
    const queryId = validator.escape(req.query.id);

    try {
      const rating = await Rating.findOne({
        senderId: user._id,
        receiverId: queryId,
        category,
      });

      res.json({
        rating: rating ? rating.rating : -1,
      });
    } catch (err) {
      res.status(400).json(err);
    }
  },
};

module.exports = ratingController;
