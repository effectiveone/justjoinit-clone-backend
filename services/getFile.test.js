const request = require("supertest");
const express = require("express");
const getFile = require("./getFile");
const fs = require("fs");

const app = express();
app.get("/file/:name", (req, res) => {
  const fileName = req.params.name;
  const filePath = `./files/${fileName}`;
  getFile(filePath, res);
});

describe("getFile", () => {
  beforeAll(() => {
    // Create the 'files' directory
    fs.mkdirSync("./files", { recursive: true });

    // Create a test file
    fs.writeFileSync("./files/test.txt", "This is a test file.");
  });

  afterAll(() => {
    // Clean up the test file
    fs.unlinkSync("./files/test.txt");

    // Remove the 'files' directory
    fs.rmdirSync("./files");
  });

  test("responds with a file if it exists", async () => {
    const response = await request(app).get("/file/test.txt");
    expect(response.status).toBe(200);
    expect(response.text).toEqual("This is a test file.");
  });

  test("responds with a 404 status and a JSON error message if the file does not exist", async () => {
    const response = await request(app).get("/file/does_not_exist.txt");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "File not found" });
  });
});
