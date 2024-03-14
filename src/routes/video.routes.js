import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { publishAVideo , getVideoById ,updateVideo,getAllVideosByUserId ,updateThumbnail, deleteVideo,togglePublishStatus, getAllVideos,searchVideos , incrementView} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.video.midddleware.js";
import {uploadImage} from  "../middlewares/multer.middleware.js"
const router  = Router();

router.route("/getAllVideos").get( getAllVideos);
router.route("/publish-video").post(verifyJwt , upload.fields([{name:"thumbnail", maxCount:1} , {name:"video" , maxCount:1}]) ,publishAVideo);
router.route("/v/:videoId").get(verifyJwt ,  getVideoById);
router.route("/updateVideo/:videoId").post(verifyJwt , updateVideo);
router.route("/deleteVideo/:videoId").get(verifyJwt , deleteVideo);
router.route("/togglePublishStatus/:videoId").get(verifyJwt , togglePublishStatus);
router.route("/getAllVideosByUserId/:userId").get(getAllVideosByUserId);
router.route("/updateThumbnail/:videoId").post(verifyJwt , uploadImage.single("thumbnail") , updateThumbnail)
router.route("/incrementView/:videoId").post(incrementView);
router.route("/searchVideos").post(searchVideos);

export default router;