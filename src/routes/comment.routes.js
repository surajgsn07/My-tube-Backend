import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import {getVideoComments , addComment , updateComment , deleteComment} from "../controllers/comment.controller.js"
const router  = Router();

router.route("/getVideoComments/:videoId").get(getVideoComments);
router.route("/addComment/:videoId").post(verifyJwt , addComment);
router.route("/updateComment/:commentId").post(verifyJwt , updateComment);
router.route("/deleteComment/:commentId").get(verifyJwt , deleteComment);

export default router;
