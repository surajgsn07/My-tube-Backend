import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes , total comments , watch time etc.
    const videos = await Video.find(
        {
            owner:req.user?.id
        }
    );

    if(!videos){
        throw new ApiError(500 , "Error while fetching videos");
    }

    let views = 0;
    videos.map((video)=>{
        views = views + video.views;
    })
    
    const  subscribersDocuments = await Subscription.find(
        {
            channel:req.user?._id,
        }
    );

    if(!subscribersDocuments){
        throw new ApiError(500 , "Error while fetching subscriber documents");
    }

    let subscribers = subscribersDocuments.length;

    let numberOfVideos = videos.length;
    let numberOfLikes = 0;
    let numberOfComments = 0;
    
    videos.map(async(v)=>{
        let likes = await Like.find({
            video:v._id
        })
        if(!likes){
            throw new ApiError(500 , "Error while fetching likes ");
        }
        let comments = await Comment.find({
            video:v._id
            }
        )
        if(!comments){
            throw new ApiError(500 , "Error while fetching comments");
        }
        numberOfComments = numberOfComments + comments.length;
        numberOfLikes  = numberOfLikes + likes.length;
    })

    return res.status(200)
    .json(
        new ApiResponse(
            200 ,
            {
                views:views,
                subscribers:subscribers,
                numberOfVideos:numberOfVideos,
                numberOfLikes:numberOfLikes,
                numberOfComments:numberOfComments
            },
            "Dashboard data fetched succesfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find(
        {
            owner:req.user?._id
        }
    );

    if(!videos){
        throw new ApiError(500 , "Error while fetching the videos");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }