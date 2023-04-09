const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

function getFile(address, res) {
  fs.access(address, fs.F_OK, (err) => {
    if (err) {
      res.status(404).json({
        message: "File not found",
      });
      return;
    }
    res.sendFile(path.resolve(address));
  });
}

module.exports = getFile;
