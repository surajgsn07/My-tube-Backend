import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400 , "Video id is required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400 , "Video not found");
    }
    
    const liked = await Like.findOne(
        {
            video:videoId,
            likedBy:req.user?._id
        }
    );

    let response = null;

    if(liked){
        response = await Like.findOneAndDelete(
            {
                video:videoId,
                likedBy:req.user?._id
            }
        );
    }else{
        response = await Like.create(
            {
                video:videoId,
                likedBy:req.user?._id
            }
        )
    }

    if(response === null){
        throw new ApiError(500 , "Something went wrong while toggling");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Toggled successfully"
        )
    )
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400 , "commentId is required");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400 , "Comment not found");
    }
    
    const liked = await Like.findOne(
        {
            comment:commentId,
            likedBy:req.user?._id
        }
    );

    let response = null;

    if(liked){
        response = await Like.findOneAndDelete(
            {
                comment:commentId,
                likedBy:req.user?._id
            }
        );
    }else{
        response = await Like.create(
            {
                comment:commentId,
                likedBy:req.user?._id
            }
        )
    }

    if(response === null){
        throw new ApiError(500 , "Something went wrong while toggling");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Toggled successfully"
        )
    )
    //TODO: toggle like on comment

})
//check later
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(400 , "Tweet id is required");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400 , "Tweet not found");
    }
    
    const liked = await Like.findOne(
        {
            tweet:tweetId,
            likedBy:req.user?._id
        }
    );

    let response = null;

    if(liked){
        response = await Like.findOneAndDelete(
            {
                tweet:tweetId,
                likedBy:req.user?._id
            }
        );
    }else{
        response = await Like.create(
            {
                tweet:tweetId,
                likedBy:req.user?._id
            }
        )
    }

    if(response === null){
        throw new ApiError(500 , "Something went wrong while toggling");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Toggled successfully"
        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if(!req.user){
        throw new ApiError("User not found");
    }
    let likedVideos = await Like.find(
        {
            video: { $exists: true },
            likedBy:req.user?._id
        }
    ).populate({
        path:"video",
        select:"thumbnail title duration duration owner"
    });
    
    if(!likedVideos){
        throw new ApiError(500 , "Something went wrong while getting the list")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked Videos fetched successfully"
        )
    )
})

const getLikesOfVideoById = asyncHandler(async(req,res) => {
    const {videoId } = req.params;
    if(!videoId){
        throw new ApiError(400 , "Video id is required");
    }

    const validity = isValidObjectId(videoId);
    if(!validity){
        throw new ApiError(400 , "Given video id is not valid");
    }

    const likes = await Like.find(
        {
            video:videoId
        }
    );

    if(!likes){
        throw new ApiError(500 , "Some error in getting likes from database");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            likes,
            "Likes got successfully"
        )
    )
})

const getLikesOfCommentById = asyncHandler (async (req,res) =>{
    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(400 , "Comment id is required");
    }

    const validity = isValidObjectId(commentId);
    if(!validity){
        throw new ApiError(400 , "Comment id is not valid");
    }

    const likes = await Like.find(
        {
            comment:commentId
        }
    );
    if(!likes){
        throw new ApiError(500 , "Error while getting comment like data from database");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200 ,
            likes,
            "Comment likes fetched successfully"
        )
    )

    
})

const getLikesOfTweetById = asyncHandler (async (req,res) =>{
    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400 , "tweet id is required");
    }

    const validity = isValidObjectId(tweetId);
    if(!validity){
        throw new ApiError(400 , "tweet id is not valid");
    }

    const likes = await Like.find(
        {
            tweet:tweetId
        }
    );
    if(!likes){
        throw new ApiError(500 , "Error while getting tweet like data from database");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200 ,
            likes,
            "tweet likes fetched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikesOfVideoById,
    getLikesOfCommentById,
    getLikesOfTweetById
}