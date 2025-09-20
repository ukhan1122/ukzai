const multer = require("multer");
const path = require("path");

// Setup storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // uploads folder in root
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Export middleware
const upload = multer({ storage });
module.exports = upload;
