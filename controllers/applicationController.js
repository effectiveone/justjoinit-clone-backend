const Application = require("../model/Application");
const Job = require("../model/Job");

const checkIfAppliedPreviously = async (userId, jobId) => {
  return await Application.findOne({
    userId,
    jobId,
    status: {
      $nin: ["deleted", "accepted", "cancelled"],
    },
  });
};

const findJobById = async (jobId) => {
  return await Job.findOne({ _id: jobId });
};

const countActiveApplications = async (jobId) => {
  return await Application.countDocuments({
    jobId,
    status: {
      $nin: ["rejected", "deleted", "cancelled", "finished"],
    },
  });
};

const countUserActiveApplications = async (userId) => {
  return await Application.countDocuments({
    userId,
    status: {
      $nin: ["rejected", "deleted", "cancelled", "finished"],
    },
  });
};

const countAcceptedJobs = async (userId) => {
  return await Application.countDocuments({
    userId,
    status: "accepted",
  });
};

const applicationController = {
  applyForJob: async (req, res) => {
    const { user } = req;
    if (user.type != "applicant") {
      res.status(401).json({
        message: "You don't have permissions to apply for a job",
      });
      return;
    }
    const data = req.body;
    const jobId = req.params.id;

    const appliedApplication = await checkIfAppliedPreviously(user._id, jobId);

    if (appliedApplication !== null) {
      res.status(400).json({
        message: "You have already applied for this job",
      });
      return;
    }

    const job = await findJobById(jobId);

    if (job === null) {
      res.status(404).json({
        message: "Job does not exist",
      });
      return;
    }

    const activeApplicationCount = await countActiveApplications(jobId);

    if (activeApplicationCount < job.maxApplicants) {
      const myActiveApplicationCount = await countUserActiveApplications(
        user._id
      );

      if (myActiveApplicationCount < 10) {
        const acceptedJobs = await countAcceptedJobs(user._id);

        if (acceptedJobs === 0) {
          const application = new Application({
            userId: user._id,
            recruiterId: job.userId,
            jobId: job._id,
            status: "applied",
            sop: data.sop,
          });

          try {
            await application.save();
            res.json({
              message: "Job application successful",
            });
          } catch (err) {
            res.status(400).json(err);
          }
        } else {
          res.status(400).json({
            message:
              "You already have an accepted job. Hence you cannot apply.",
          });
        }
      } else {
        res.status(400).json({
          message: "You have 10 active applications. Hence you cannot apply.",
        });
      }
    } else {
      res.status(400).json({
        message: "Application limit reached",
      });
    }
  },
  recruterView: (req, res) => {
    const user = req.user;
    if (user.type != "recruiter") {
      res.status(401).json({
        message: "You don't have permissions to view job applications",
      });
      return;
    }
    const jobId = req.params.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

    let findParams = {
      jobId: jobId,
      recruiterId: user._id,
    };

    let sortParams = {};

    if (req.query.status) {
      findParams = {
        ...findParams,
        status: req.query.status,
      };
    }

    Application.find(findParams)
      .collation({ locale: "en" })
      .sort(sortParams)
      .skip(skip)
      .limit(limit)
      .then((applications) => {
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  allAppliedApplications: (req, res) => {
    const user = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

    Application.aggregate([
      {
        $lookup: {
          from: "jobapplicantinfos",
          localField: "userId",
          foreignField: "userId",
          as: "jobApplicant",
        },
      },
      { $unwind: "$jobApplicant" },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      {
        $lookup: {
          from: "recruiterinfos",
          localField: "recruiterId",
          foreignField: "userId",
          as: "recruiter",
        },
      },
      { $unwind: "$recruiter" },
      {
        $match: {
          [user.type === "recruiter" ? "recruiterId" : "userId"]: user._id,
        },
      },
      {
        $sort: {
          dateOfApplication: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ])
      .then((applications) => {
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },

  updateStatusApplication: (req, res) => {
    const user = req.user;
    const id = req.params.id;
    const status = req.body.status;

    if (user.type === "recruiter") {
      if (status === "accepted") {
        Application.findOne({
          _id: id,
          recruiterId: user._id,
        })
          .then((application) => {
            if (application === null) {
              res.status(404).json({
                message: "Application not found",
              });
              return;
            }

            Job.findOne({
              _id: application.jobId,
              userId: user._id,
            }).then((job) => {
              if (job === null) {
                res.status(404).json({
                  message: "Job does not exist",
                });
                return;
              }

              Application.countDocuments({
                recruiterId: user._id,
                jobId: job._id,
                status: "accepted",
              }).then((activeApplicationCount) => {
                if (activeApplicationCount < job.maxPositions) {
                  // accepted
                  application.status = status;
                  application.dateOfJoining = req.body.dateOfJoining;
                  application
                    .save()
                    .then(() => {
                      Application.updateMany(
                        {
                          _id: {
                            $ne: application._id,
                          },
                          userId: application.userId,
                          status: {
                            $nin: [
                              "rejected",
                              "deleted",
                              "cancelled",
                              "accepted",
                              "finished",
                            ],
                          },
                        },
                        {
                          $set: {
                            status: "cancelled",
                          },
                        },
                        { multi: true }
                      )
                        .then(() => {
                          if (status === "accepted") {
                            Job.findOneAndUpdate(
                              {
                                _id: job._id,
                                userId: user._id,
                              },
                              {
                                $set: {
                                  acceptedCandidates:
                                    activeApplicationCount + 1,
                                },
                              }
                            )
                              .then(() => {
                                res.json({
                                  message: `Application ${status} successfully`,
                                });
                              })
                              .catch((err) => {
                                res.status(400).json(err);
                              });
                          } else {
                            res.json({
                              message: `Application ${status} successfully`,
                            });
                          }
                        })
                        .catch((err) => {
                          res.status(400).json(err);
                        });
                    })
                    .catch((err) => {
                      res.status(400).json(err);
                    });
                } else {
                  res.status(400).json({
                    message: "All positions for this job are already filled",
                  });
                }
              });
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        Application.findOneAndUpdate(
          {
            _id: id,
            recruiterId: user._id,
            status: {
              $nin: ["rejected", "deleted", "cancelled"],
            },
          },
          {
            $set: {
              status: status,
            },
          }
        )
          .then((application) => {
            if (application === null) {
              res.status(400).json({
                message: "Application status cannot be updated",
              });
              return;
            }
            if (status === "finished") {
              res.json({
                message: `Job ${status} successfully`,
              });
            } else {
              res.json({
                message: `Application ${status} successfully`,
              });
            }
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      }
    } else {
      if (status === "cancelled") {
        console.log(id);
        console.log(user._id);
        Application.findOneAndUpdate(
          {
            _id: id,
            userId: user._id,
          },
          {
            $set: {
              status: status,
            },
          }
        )
          .then((tmp) => {
            console.log(tmp);
            res.json({
              message: `Application ${status} successfully`,
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        res.status(401).json({
          message: "You don't have permissions to update job status",
        });
      }
    }
  },
  finalListApplication: (req, res) => {
    const user = req.user;
    if (user.type === "recruiter") {
      let findParams = {
        recruiterId: user._id,
      };
      if (req.query.jobId) {
        findParams = {
          ...findParams,
          jobId: new mongoose.Types.ObjectId(req.query.jobId),
        };
      }
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          findParams = {
            ...findParams,
            status: { $in: req.query.status },
          };
        } else {
          findParams = {
            ...findParams,
            status: req.query.status,
          };
        }
      }
      let sortParams = {};

      if (!req.query.asc && !req.query.desc) {
        sortParams = { _id: 1 };
      }

      if (req.query.asc) {
        if (Array.isArray(req.query.asc)) {
          req.query.asc.map((key) => {
            sortParams = {
              ...sortParams,
              [key]: 1,
            };
          });
        } else {
          sortParams = {
            ...sortParams,
            [req.query.asc]: 1,
          };
        }
      }

      if (req.query.desc) {
        if (Array.isArray(req.query.desc)) {
          req.query.desc.map((key) => {
            sortParams = {
              ...sortParams,
              [key]: -1,
            };
          });
        } else {
          sortParams = {
            ...sortParams,
            [req.query.desc]: -1,
          };
        }
      }

      Application.aggregate([
        {
          $lookup: {
            from: "jobapplicantinfos",
            localField: "userId",
            foreignField: "userId",
            as: "jobApplicant",
          },
        },
        { $unwind: "$jobApplicant" },
        {
          $lookup: {
            from: "jobs",
            localField: "jobId",
            foreignField: "_id",
            as: "job",
          },
        },
        { $unwind: "$job" },
        { $match: findParams },
        { $sort: sortParams },
      ])
        .then((applications) => {
          if (applications.length === 0) {
            res.status(404).json({
              message: "No applicants found",
            });
            return;
          }
          res.json(applications);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      res.status(400).json({
        message: "You are not allowed to access applicants list",
      });
    }
  },
};

module.exports = applicationController;
