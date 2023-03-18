import multer from "multer";
import crypto from "crypto";
import path from "path";
import { S3 } from "@aws-sdk/client-s3";
import { BUCKET } from "./config";
import ms3 from "multer-s3";
export const s3 = new S3({
  credentials: {
    accessKeyId: BUCKET.BUCKET_ACCESS_KEY,
    secretAccessKey: BUCKET.BUCKET_SECRET_KEY,
  },
  endpoint: BUCKET.BUCKET_ENDPOINT,
});

const s3Storage = ms3({
  bucket: BUCKET.BUCKET_NAME,
  s3,
  contentType(req, file, callback) {
    callback(null, file.mimetype);
  },
  key(req, file, callback) {
    callback(null, crypto.randomUUID());
  },
  metadata(req, file, cb) {
    cb(null, {
      originalName: file.originalname,
      fieldName: file.fieldname,
      mimeType: file.mimetype,
      size: file.size,
      ext: path.extname(file.originalname),
    });
  },
  acl(req, file, callback) {
    callback(null, "public-read");
  },
});
const ACCEPTED_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/mpeg",
  "video/webm",
];

export const upload = multer({
  storage: s3Storage,
  fileFilter: (req, file, cb) => {
    if (ACCEPTED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        `File Must Be Of Type: ${ACCEPTED_TYPES.join("").split(" | ")}` as any,
        false
      );
    }
  },

  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, "..", "uploads");
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, crypto.randomUUID());
  },
});
export const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    if (file.mimetype in ACCEPTED_TYPES) {
      return callback(
        ("File Not Accepted, Must Be of Type: " +
          ACCEPTED_TYPES.join("|")) as any
      );
    }
    callback(null, true);
  },
});
*/
