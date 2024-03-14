import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import {toggleVideoLike , toggleCommentLike , toggleTweetLike , getLikedVideos , getLikesOfVideoById , getLikesOfCommentById,getLikesOfTweetById} from '../controllers/like.controller.js'
const router  = Router();


router.route("/toggleVideoLike/:videoId").get(verifyJwt , toggleVideoLike);

router.route("/toggleCommentLike/:commentId").get(verifyJwt , toggleCommentLike);

router.route("/toggleTweetLike/:tweetId").get(verifyJwt , toggleTweetLike);

router.route("/getLikedVideos").post(verifyJwt , getLikedVideos);

router.route("/getLikesOfVideoById/:videoId").get( getLikesOfVideoById);

router.route("/getLikesOfCommentById/:commentId").get( getLikesOfCommentById);

router.route("/getLikesOfTweetById/:tweetId").get(getLikesOfTweetById);

export default router;


