import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from '../models/user.model.js'
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400 , "All fields are required");
    }

    if(!req.user){
        throw new ApiError(400 , "User not found");
    }

    const playlist = await Playlist.create(
        {
            name,
            description,
            owner : req.user?._id
        }
    );

    if(!playlist){
        throw new ApiError(400 , "playlist cannot be made");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist made successfully"
        )
    )
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400 , "Userid is required");
    }

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(400 , "User cant be find");
    }

    const playlists = await Playlist.find(
        {
            owner:user._id
        }
    )

    if(!playlists){
        throw new ApiError(500 , "Playlists not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully"
        )
    )
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400 , "PlayList id required");
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400 , "Playlist dont exist");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    );
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiError(400 , "All fields are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400 , "Playlist cannot be found");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400 , "Video not found");
    }

    if(String(playlist.owner) !== String(req.user?._id)){
        throw new ApiError(400 , "Playlist doesnt belong to the user");
    }

    playlist.videos.push(video._id);
    await  playlist.save();

    if(playlist.videos.length === 0){
        throw new ApiError(500 , "Videos not posted inside the playlist");
    }
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Video posted inside playlist sucessfully"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId || !videoId){
        throw new ApiError(400 , "All fields are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400 , "Playlist not found");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400 , "Video not found");
    }

    
    if(String(playlist.owner) !== String(req.user?._id)){
        throw new ApiError(400 , "Playlist doesnt belong to the user");
    }
    
    if(!playlist.videos.includes(video._id)){
        throw new ApiError(400 , "Video doesnt exist inside the playlist");
    }


    console.log(playlist.videos)
    playlist.videos  = playlist.videos.filter( elem => String(elem) !== String(video._id));
    await playlist.save();
    console.log(playlist.videos)


    if(playlist.videos.includes(String(video._id))){
        throw new ApiError(500 , "video not removed");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200 ,
            playlist,
            "Video removed successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400 , "Playlist id required");
    }

    const playlist =await  Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400 , "Playlist not found");
    }

    if(String(playlist.owner) !== String(req.user?._id)){
        throw new ApiError(400 , "Playlist doesnt belong to the user");
    }

    const playlistRes = await Playlist.findByIdAndDelete(playlistId);
    if(!playlistRes){
        throw new ApiError(400 , "something went wrong to delete that playlist");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200 , 
            playlistRes,
            "Playlist deleted successfully"
        )
    )
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!playlistId || !name || !description){
        throw new ApiError(400 , "All fields are required");
    }

    const playlist =await  Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400 , "Playlist not found");
    }

    if(String(playlist.owner) !== String(req.user?._id)){
        throw new ApiError(400 , "Playlist doesnt belong to the user");
    }

    const playlistResponse = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {
            new:true
        }
    );

    if(!playlistResponse){
        throw new ApiError(400 , "Playlist not found or something went wrong while updating the playlist");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            playlistResponse,
            "Playlist updated successfully"
        )
    )
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}