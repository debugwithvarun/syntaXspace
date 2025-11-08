import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";



const uploadDir = path.resolve("Public", "profilepic"); // absolute & clean

// Ensure directory exists on server start
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created upload directory:", uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // Use crypto to avoid collisions and hide original names
    const uniqueName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${ext}`);
  },
});

// Export a ready-to-use multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only JPG, PNG, and WebP files are allowed"));
    }
    cb(null, true);
  },
});
