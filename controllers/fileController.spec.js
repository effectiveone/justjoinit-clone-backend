const { resume, profile } = require("./fileController");
const getFile = require("../services/getFile");
const httpMocks = require("node-mocks-http");
jest.mock("../services/getFile");

test("Resume: valid file", async () => {
  const req = httpMocks.createRequest({ params: { file: "test.pdf" } });
  const res = httpMocks.createResponse();
  await resume(req, res);
  expect(getFile).toHaveBeenCalled();
});

test("Profile: valid file", async () => {
  const req = httpMocks.createRequest({ params: { file: "test.jpg" } });
  const res = httpMocks.createResponse();
  await profile(req, res);
  expect(getFile).toHaveBeenCalled();
});

test("Validate Filename: valid filename", () => {
  expect(validateFilename("example.pdf")).toBe(true);
});

test("Validate Filename: invalid filename", () => {
  expect(validateFilename("example#test.pdf")).toBe(false);

  test("Resume: invalid file", async () => {
    const req = httpMocks.createRequest({
      params: { file: "invalid#file.pdf" },
    });
    const res = httpMocks.createResponse();
    await resume(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("Profile: invalid file", async () => {
    const req = httpMocks.createRequest({
      params: { file: "invalid#file.jpg" },
    });
    const res = httpMocks.createResponse();
    await profile(req, res);
    expect(res.statusCode).toBe(400);
  });
});
