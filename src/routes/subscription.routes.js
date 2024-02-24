import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { toggleSubscription , getUserChannelSubscribers , getSubscribedChannels} from "../controllers/subscription.controller.js";
const router  = Router();

router.route("/toggleSubscription/:channelId").get(verifyJwt , toggleSubscription);
router.route("/getUserChannelSubscribers/:channelId").get(verifyJwt , getUserChannelSubscribers);
router.route("/getSubscribedChannels/:subscriberId").get(verifyJwt , getSubscribedChannels);

export default router;