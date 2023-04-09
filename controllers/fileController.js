const path = require("path");
const mime = require("mime-types");

const getFile = require("../services/getFile");
const uploadFile = require("../services/uploadFile");

// Dodaj funkcję walidacji nazwy pliku
function validateFilename(filename) {
  const validFilenameRegex = /^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)*$/;
  return validFilenameRegex.test(filename);
}

const fileController = {
  resume: (req, res) => {
    if (!validateFilename(req.params.file)) {
      return res.status(400).json({ message: "Invalid file name" });
    }

    const address = path.join(__dirname, `../public/resume/${req.params.file}`);
    getFile(address, res);
  },
  profile: (req, res) => {
    if (!validateFilename(req.params.file)) {
      return res.status(400).json({ message: "Invalid file name" });
    }

    const address = path.join(
      __dirname,
      `../public/profile/${req.params.file}`
    );
    getFile(address, res);
  },
  uploadResume: async (req, res) => {
    // Sprawdź typ MIME
    const mimeType = mime.lookup(req.file.originalname);
    if (mimeType !== "application/pdf") {
      return res.status(400).json({ message: "Invalid file type" });
    }

    await uploadFile(req, res, ".pdf", "resume", "File uploaded successfully");
  },
  uploadProfile: async (req, res) => {
    // Sprawdź typ MIME
    const mimeType = mime.lookup(req.file.originalname);
    if (mimeType !== "image/jpeg") {
      return res.status(400).json({ message: "Invalid file type" });
    }

    await uploadFile(
      req,
      res,
      ".jpg",
      "profile",
      "Profile image uploaded successfully"
    );
  },
};

module.exports = fileController;
