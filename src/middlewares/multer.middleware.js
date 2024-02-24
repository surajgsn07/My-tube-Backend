import multer from "multer";
import { ApiError } from "../utils/ApiError.js";


// Define a file filter function to check if the file is an image
const imageFileFilter = (req, file, cb) => {
  // Check if the file is an image based on MIME type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new ApiError (400 , "Only image file is allowed"),
      false
    ); // Reject the file
  }
};


const videoFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new ApiError (400 , "Only video file is allowed"),
      false
    ); // Reject the file
  }
};


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter // Apply the image file filter
});


