const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const path = require("path");

const pipeline = promisify(require("stream").pipeline);
const app = express();

const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
const uploadFile =
  (upload) => async (req, res, extension, subfolder, successMessage) => {
    upload(req, res, async (err) => {
      if (err) {
        res.status(400).json({
          message: "Error while uploading",
        });
        return;
      }

      const { file } = req;
      if (path.extname(file.originalname) !== extension) {
        res.status(404).json({
          message: "Invalid format",
        });
        return;
      }

      const filename = `${uuidv4()}${path.extname(file.originalname)}`;

      // Create the directory if it doesn't exist
      const dirPath = `${__dirname}/../public/${subfolder}`;
      createDirIfNotExists(dirPath);

      pipeline(
        file.stream,
        fs.createWriteStream(`${__dirname}/../public/${subfolder}/${filename}`)
      )
        .then(() => {
          res.status(200).send({
            message: successMessage,
            url: `/upload/${subfolder}/${filename}`,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(400).json({
            message: err,
          });
        });
    });
  };

module.exports = uploadFile;
