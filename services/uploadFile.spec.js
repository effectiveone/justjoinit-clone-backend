const request = require("supertest");
const express = require("express");
const multer = require("multer");
const uploadFile = require("./uploadFile");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const uploadFileMiddleware = uploadFile(upload.single("file"));

app.post("/upload", (req, res) => {
  uploadFileMiddleware(
    req,
    res,
    ".txt",
    "uploads",
    "File uploaded successfully"
  );
});

describe("uploadFile", () => {
  test("responds with a 404 status and an error message if the file format is invalid", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("Invalid file content"), "invalid.pdf");

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("Invalid format");
  });
});
