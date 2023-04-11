const bodyParser = require("body-parser");
const express = require("express");
const Job = require("../model/Job");
const cleanData = require("../helpers/cleanData");

const jobController = {
  addJob: async (req, res) => {
    const { body } = req;
    const { user } = body;
    console.log("body", req.body);
    const data = cleanData(body);
    console.log("data", data);

    if (user?.type !== "recruiter") {
      return res
        .status(401)
        .json({ message: "You don't have permissions to add jobs" });
    }

    const job = new Job({ ...data, userId: user._id });

    try {
      await job.save();
      res.json({ message: "Job added successfully to the database" });
    } catch (err) {
      res.status(400).json(err);
    }
  },
  getAllJobs: async (req, res) => {
    const { query } = req;
    const {
      q,
      location,
      jobType,
      salaryMin,
      salaryMax,
      duration,
      asc,
      desc,
      techStack,
    } = cleanData(query);
    console.log("location", location);

    const findParams = {
      ...(q && { title: { $regex: new RegExp(q, "i") } }),
      ...(jobType && { jobType: { $in: [].concat(jobType) } }),
      ...((salaryMin || salaryMax) && {
        salary: {
          ...(salaryMin && { $gte: parseInt(salaryMin) }),
          ...(salaryMax && { $lte: parseInt(salaryMax) }),
        },
      }),
      ...(duration && { duration: { $lt: parseInt(duration) } }),
      ...(location && { locations: { $in: [].concat(location) } }),
    };

    const sortParams = {
      ...(asc && Object.fromEntries([].concat(asc).map((key) => [key, 1]))),
      ...(desc && Object.fromEntries([].concat(desc).map((key) => [key, -1]))),
    };

    let pipeline = [
      { $match: findParams },
      ...(Object.keys(sortParams).length > 0 ? [{ $sort: sortParams }] : []),
    ];

    if (techStack) {
      pipeline = [
        ...pipeline,
        {
          $match: {
            "techStack.name": {
              $in: Array.isArray(techStack) ? techStack : [techStack],
            },
          },
        },
      ];
    }

    try {
      const jobs = await Job.aggregate(pipeline);

      res.json(jobs);
    } catch (err) {
      res.status(400).json(err);
    }
  },

  selectedJob: async (req, res) => {
    const cleanedId = cleanData(req.params).id;

    try {
      const job = await Job.findOne({ _id: cleanedId });

      if (!job) {
        return res.status(400).json({ message: "Job does not exist" });
      }

      res.json(job);
    } catch (err) {
      res.status(400).json(err);
    }
  },

  updateParticularJob: async (req, res) => {
    const { user, params, body } = req;
    const data = cleanData(body);

    if (user.type !== "recruiter") {
      return res.status(401).json({
        message: "You don't have permissions to change the job details",
      });
    }

    try {
      const job = await Job.findOne({ _id: params.id, userId: user.id });

      if (!job) {
        return res.status(404).json({ message: "Job does not exist" });
      }

      Object.assign(job, data);
      await job.save();

      res.json({ message: "Job details updated successfully" });
    } catch (err) {
      res.status(400).json(err);
    }
  },

  deleteParticularJob: async (req, res) => {
    const { user } = req;
    const cleanedParams = cleanData(req.params);

    if (user.type !== "recruiter") {
      return res
        .status(401)
        .json({ message: "You don't have permissions to delete the job" });
    }

    try {
      const job = await Job.findOneAndDelete({
        _id: cleanedParams.id,
        userId: user.id,
      });

      if (!job) {
        return res
          .status(401)
          .json({ message: "You don't have permissions to delete the job" });
      }

      res.json({ message: "Job deleted successfully" });
    } catch (err) {
      res.status(400).json(err);
    }
  },
};

module.exports = jobController;
