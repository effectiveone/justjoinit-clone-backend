const express = require("express");

const router = express.Router();

const fileController = require("../controllers/fileController");

router.post("/resume", fileController.uploadResume);

router.post("/profile", fileController.uploadProfile);

module.exports = router;
