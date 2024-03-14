import { Router } from "express";
import {createTweet , getUserTweets , updateTweet ,deleteTweet,getTweetById } from '../controllers/tweet.controller.js'
import { verifyJwt} from "../middlewares/auth.middleware.js";
const router  = Router();


router.route("/createTweet").post(verifyJwt , createTweet);
router.route("/getUserTweets/:username").get( getUserTweets);
router.route("/updateTweet/:tweetId").post(verifyJwt,updateTweet);
router.route("/deleteTweet/:tweetId").post(verifyJwt,deleteTweet);
router.route("/getTweetById/:tweetId").get(getTweetById);

export default router;
