import { Router } from "express";
import { changePassword, getCurrentUser, getUserById, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateUserAvatar } from "../controllers/user.controller.js";
import { uploadImage } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router  = Router();

router.route('/register').post( 
    uploadImage.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt , logoutUser);

router.route("/getUserById/:userId").get(getUserById);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt , changePassword);
router.route("/current-user").get(verifyJwt , getCurrentUser);
router.route("/update-account").patch(verifyJwt , updateAccountDetails);
router.route("/avatar").patch(verifyJwt , uploadImage.single("avatar") , updateUserAvatar);
router.route("/cover-image").patch(verifyJwt , uploadImage.single("coverImage") , updateCoverImage);
router.route("/c/:username").get(verifyJwt , getUserChannelProfile);
router.route("/history").get(verifyJwt , getWatchHistory);


export default router;