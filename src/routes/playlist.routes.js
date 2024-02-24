import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import {createPlaylist , getUserPlaylists , getPlaylistById , addVideoToPlaylist , removeVideoFromPlaylist , deletePlaylist ,updatePlaylist } from '../controllers/playlist.controller.js'
const router  = Router();

router.route("/createPlaylist").post(verifyJwt , createPlaylist);
router.route("/getUserPlaylists/:userId").get( getUserPlaylists);
router.route("/getPlaylistById/:playlistId").get(getPlaylistById);
router.route("/addVideoToPlaylist/:playlistId/:videoId").get(verifyJwt , addVideoToPlaylist);
router.route("/removeVideoFromPlaylist/:playlistId/:videoId").get(verifyJwt , removeVideoFromPlaylist);
router.route("/deletePlaylist/:playlistId").get(verifyJwt , deletePlaylist);
router.route("/updatePlaylist/:playlistId").get(verifyJwt , updatePlaylist);

export default router;
