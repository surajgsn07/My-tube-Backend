import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import {getChannelVideos , getChannelStats} from "../controllers/dashboard.controller.js"
const router  = Router();

router.route("/getChannelStats").post(verifyJwt , getChannelStats);
router.route("/getChannelVideos").post(verifyJwt  , getChannelVideos);

export default router;
