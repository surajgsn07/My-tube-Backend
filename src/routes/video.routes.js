import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { publishAVideo , getVideoById ,updateVideo , deleteVideo,togglePublishStatus, getAllVideos} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.video.midddleware.js";
import {uploadImage} from  "../middlewares/multer.middleware.js"
const router  = Router();

router.route("getAllVideos").get(verifyJwt , getAllVideos);
router.route("/publish-video").post(verifyJwt , upload.fields([{name:"thumbnail", maxCount:1} , {name:"video" , maxCount:1}]) ,publishAVideo);
router.route("/v/:videoId").get(verifyJwt , getVideoById);
router.route("/updateVideo/:videoId").get(verifyJwt , uploadImage.single("thumbnail") , updateVideo);
router.route("/deleteVideo/:videoId").get(verifyJwt , deleteVideo);
router.route("/togglePublishStatus/:videoId").get(verifyJwt , togglePublishStatus);


export default router;