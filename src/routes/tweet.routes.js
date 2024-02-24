import { Router } from "express";
import {createTweet , getUserTweets , updateTweet ,deleteTweet } from '../controllers/tweet.controller.js'
import { verifyJwt} from "../middlewares/auth.middleware.js";
const router  = Router();


router.route("/createTweet").post(verifyJwt , createTweet);
router.route("/getUserTweets/:username").get( getUserTweets);
router.route("/updateTweet/:tweetId").get(verifyJwt,updateTweet);
router.route("/deleteTweet/:tweetId").get(verifyJwt,deleteTweet);

export default router;
