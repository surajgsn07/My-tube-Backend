import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from '../models/video.model.js';

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400 , "Video id is required");
    }
    const {page = 1, limit = 2} = req.query
    const comments = await Comment.aggregate(
        [
            {
                $match:{
                    video:new mongoose.Types.ObjectId(videoId)
                }
            }
        ]
    );

    if(!comments){
        throw new ApiError(500 , "Error while fetching comments");
    }

    const options = {
        page,
        limit
    };

    const response = await Comment.aggregatePaginate(comments , options);
    if(!response){
        throw new ApiError(500 , "Error while paginating the comments");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response.docs,
            "Paginated comments fetched successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;
    if(!req.user){
        throw new ApiError(400 , "User not found");
    }
    if(!content || !videoId){
        throw new ApiError(400 , "All fields are required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400 , "Video not found");
    }

    const comment = await Comment.create(
        {
            content,
            video:videoId,
            owner:req.user._id
        }
    )

    if(!comment){
        throw new ApiError(500 , "Comment cant be made");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment made successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;
    if(!commentId || !content){
        throw new ApiError(400 , "All fields are required");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400 , "Comment dont exist");
    }

    if(String(comment.owner) !== String(req.user._id)){
        throw new ApiError(400 , "Comment doesnt belong to the user");
    }

    const updatedComment  = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },{
            new:true
        }
    );

    if(!updatedComment){
        throw new ApiError(500 , "Comment not made");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(400 , "Comment id is required");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400 , "Comment dont exist");
    }

    if(String(comment.owner) !== String(req.user._id)){
        throw new ApiError(400 , "Comment doesnt belong to the user");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
        throw new ApiError(500 , "Cant delte the comment");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }