import express from 'express';
import multer from 'multer';

const router =express.Router();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;

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