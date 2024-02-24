import mongoose, {Schema, isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadToCloudinary ,publicId , deleteVideoFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 1, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const obj = {
        field:sortBy,
        test:sortType
    }
    const options = {
        page,
        limit,
        sort : obj,
    }


    const myAggregate = await Video.aggregate();
    const response  = await Video.aggregatePaginate(myAggregate , options);
    // console.log(response)
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    // get the video , thumbnail from multer  and other things from the body✅
    // validate it✅
    // get the user✅
    // validate if user is there✅
    // upload video and thumbnail to the cloundinary✅
    // validate cloudinary response✅
    // get the duration of the video from the cloudinary✅
    // validate duration✅
    // upload it to database✅
    // res send✅


    const {title , description} = req.body;

    if(!title || !description){
        throw new ApiError(400 , "title and description is required");
    }

    if(!req.files.thumbnail || !req.files.video){
        throw new ApiError(400 , "video and thumbnail is required")
    }
    
    const thumbnailLocalPath = req.files.thumbnail[0]?.path;
    const videoLocalPath = req.files.video[0]?.path;

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400 , "video and thumbnail both are required");
    }


    const owner = await User.findById(req.user?._id);
    if(!owner){
        throw new ApiError(400 , "User authentication is required");
    }

    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    // console.log(thumbnail);
    const videoFile = await uploadToCloudinary(videoLocalPath);

    if(!thumbnail || !videoFile){
        throw new ApiError(500 , "Something happened wrong while uploading to cloudinary");
    }
    
    const duration = Number(videoFile.duration);
    // console.log(duration)
    if(!duration){
        throw new ApiError(500 , "Duration fetching unsuccessfull");
    }

    const videoUpload = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration,
        owner:owner._id
    })

    if(!videoUpload){
        throw new ApiError(500 , "Something went wrogn while uploading video to the video model")
    }


    return res.status(200)
        .json(
            new ApiResponse(
                200 ,
                videoUpload,
                "Video uploaded succesfully"
            )
        )
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiResponse(400, "Video id is required");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] },
                isSubscribed: {
                    $cond: {
                        if: {
                            $and: [
                                { $isArray: "$owner.subscribers" },
                                {
                                    $in: [
                                        new mongoose.Types.ObjectId(req.user._id),
                                        "$owner.subscribers.subscriber"
                                    ]
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                // ... add other fields you want to include
                "owner.subscribersCount": 1,
                "owner.channelSubscribedToCount": 1,
                "owner.isSubscribed": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1
            }
        }
    ]);

    if (!video || video.length === 0) {
        throw new ApiError(500, "Video cannot be fetched successfully");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video[0],
            "Video fetched successfully"
        )
    );
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    const {title , description} = req.body;
    const thumbnailLocalPath = req.file?.path;

    if(!videoId){
        throw new ApiError(400 , "Video is is required");
    }

    if(!title || !description){
        throw new ApiError(400 , "Title and description is required");
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400 , "Thumbnail is required");
    }

    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

    if(!thumbnail){
        throw new ApiError(500 , "SOmething went wrong while uploading new thumbnail to cloudinary");
    }
    

    const oldVideo = await Video.findById(videoId);
    if(!oldVideo){
        throw new ApiError(400 , "Video dont exist");
    }


    if(oldVideo._id !== req.user._id){
        throw new ApiError(400 , "Video doesnot belong to the user")
    }

    const oldThumbnail = oldVideo.thumbnail;
    
    const id = await publicId(oldThumbnail);


    const deletedThumbnail = await deleteFromCloudinary(id);
    
    if(!deletedThumbnail || deletedThumbnail.result != "ok"){
        throw new ApiError(500 , "Something went wrong while deleting file from the cloudinary");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail:thumbnail.url
            }
        },{new:true}
    )

    if(!video){
        throw new ApiError(500 , "Somethings went wrong while updating video");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video updates successfully"
        )
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    // video id lo✅
    // validate kro video id✅
    // video dhundo id se✅
    // validate kro✅
    // url nikalo  thumbnail and video ka✅
    // public id nikalo thumbnail and video ka✅
    // validate kro id ko thumbnail and video ka✅
    // delete video from model ✅
    // verify kro delete hua ki nhi✅
    // delete pe lgado cloudinary se video ko thumbnail and video ka✅
    // varify kro video delete hui ya nhi thumbnail and video ka✅
    // response send krdo
    
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400 , "Video id is required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400 , "Video not found");
    }

    const videoUrl = video.videoFile;
    if(!videoUrl){
        throw new ApiError(500 , "Video url cannot find");
    }

    const thumbnailUrl  = video.thumbnail;
    if(!thumbnailUrl){
        throw new ApiError(500 , "Video thumbnail url cannot be found");
    }

    // console.log(videoUrl);

    const videoPublicId = await publicId(videoUrl);
    if(!videoPublicId){
        throw new ApiError(500 , "Video public id cannot be  found");
    }

    // console.log(thumbnailUrl)

    const thumbnailPublicId = await publicId(thumbnailUrl);
    // console.log(thumbnailPublicId);
    if(!thumbnailPublicId){
        throw new ApiError(500 , "Thumbnail public id cannot be find");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if(!deletedVideo){
        throw new ApiError(500 , "Video cant be deleted");
    }

    const delVid = await  deleteVideoFromCloudinary(videoPublicId);
    if(!delVid || delVid.result != "ok"){
        throw new ApiError(500 , "something went wrong while deleting video from cloudinary");
    }

    const delThumbnail = await deleteFromCloudinary(thumbnailPublicId);
    if(!delThumbnail || delThumbnail.result !="ok"){
        throw new ApiError(500 , "Something went wrong while deleting thumbnail from cloudinary");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200 ,
            deletedVideo,
            "video deleted successfully"
        )
    )
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400 , "VideoId is required");
    }

    const {isPublished} = req.body;
    if(isPublished === null){
        throw new ApiError(400 , "Publish status is required");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished,
                updatedAt:new Date()
            }
        },
        {
            new:true
        });
    
    if(!video){
        throw new ApiError(400 , "Video not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "IsPublished updated successfully"
        )
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}