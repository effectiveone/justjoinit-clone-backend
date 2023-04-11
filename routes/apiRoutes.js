const express = require("express");
const router = express.Router();

const jwtAuth = require("../middleware/jwtAuth");

const JobController = require("../controllers/jobController");
const recruterController = require("../controllers/recruterController");
const ApplicationController = require("../controllers/applicationController");
const RatingController = require("../controllers/ratingController");

// To add new job
router.post("/jobs", jwtAuth, JobController.addJob);

// to get all avaible  jobs
router.get("/jobs", JobController.getAllJobs);

// to get info about a particular job
router.get("/jobs/:id", JobController.selectedJob);

// to update info of a particular job
router.put("/jobs/:id", jwtAuth, JobController.updateParticularJob);

// to delete a job
router.delete("/jobs/:id", jwtAuth, JobController.deleteParticularJob);

// get user's personal details
router.get("/user", jwtAuth, recruterController.getCurrentUser);

// get user details from id
router.get("/user/:id", jwtAuth, recruterController.getUserDetails);

// update user details
router.put("/user", jwtAuth, recruterController.updateUserDetails);

// apply for a job [todo: test: done]
router.post(
  "/jobs/:id/applications",
  jwtAuth,
  ApplicationController.applyForJob
);

// recruiter gets applications for a particular job [pagination] [todo: test: done]
router.get(
  "/jobs/:id/applications",
  jwtAuth,
  ApplicationController.recruterView
);

// recruiter/applicant gets all his applications [pagination]
router.get(
  "/applications",
  jwtAuth,
  ApplicationController.allAppliedApplications
);

// update status of application: [Applicant: Can cancel, Recruiter: Can do everything] [todo: test: done]
router.put(
  "/applications/:id",
  jwtAuth,
  ApplicationController.updateStatusApplication
);

// get a list of final applicants for current job : recruiter
// get a list of final applicants for all his jobs : recuiter
router.get("/applicants", jwtAuth, ApplicationController.finalListApplication);

// to add or update a rating [todo: test]
router.put("/rating", jwtAuth, RatingController.updateOrCreateRating);

// get personal rating
router.get("/rating", jwtAuth, RatingController.getPersonalRating);

module.exports = router;
