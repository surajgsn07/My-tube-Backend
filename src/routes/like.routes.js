import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import {toggleVideoLike , toggleCommentLike , toggleTweetLike , getLikedVideos} from '../controllers/like.controller.js'
const router  = Router();


router.route("/toggleVideoLike/:videoId").get(verifyJwt , toggleVideoLike);

router.route("/toggleCommentLike/:commentId").get(verifyJwt , toggleCommentLike);

router.route("/toggleTweetLike/:tweetId").get(verifyJwt , toggleTweetLike);

router.route("/getLikedVideos").post(verifyJwt , getLikedVideos);

export default router;


