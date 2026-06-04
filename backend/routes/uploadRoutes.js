import express from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

const UPLOADS_DIR = 'uploads';

// Create uploads directory if it doesn't exist (important on Render/cloud deployments)
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  upload.single("pdf"),
  (req, res) => {
    console.log(req.file);
    res.status(200).json({
      message: "File uploaded successfully",
      fileName: req.file.filename,
    });
  }
);

export default router;
