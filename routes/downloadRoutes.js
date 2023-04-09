const express = require("express");

const router = express.Router();

const fileController = require("../controllers/fileController");

router.get("/resume/:file", fileController.resume);

router.get("/profile/:file", fileController.profile);

module.exports = router;
