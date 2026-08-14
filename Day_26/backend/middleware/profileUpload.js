const multer = require("multer");
const path = require("node:path");

// Stores uploaded profile images in the application's profile upload directory.
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/uploads/profile"); 
  },
  filename(req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Restricts profile uploads to the image formats supported by the application.
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});
