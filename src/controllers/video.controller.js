import mongoose, {Schema, isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadToCloudinary ,publicId , deleteVideoFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 100, query="", sortBy = "_id", sortType = 'asc', userId } = req.query;

    // Initialize the aggregation pipeline
    const pipeline = [];

    // Add match stage if there is a query parameter for the title
    if (query) {
        pipeline.push({
            $match: {
                title: { $regex: new RegExp(query, 'i') }
            }
        });
    }

    // Add match stage for userId if provided and it's valid
    if (userId) {
        const isValidObjectId = mongoose.isObjectIdOrHexString(userId);
        if (isValidObjectId) {
            pipeline.push({
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            });
        } else {
            return res.status(400).json(new ApiError(400, "Invalid userId format"));
        }
    }

    // Add sorting stage to the pipeline
    const sortStage = {};
    sortStage[sortBy] = sortType === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortStage });

    // Add pagination logic
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    try {
        const response = await Video.find();

        // If no response is returned, throw an error
        if (!response) {
            throw new ApiError(500, "Error while generating response from the database");
        }

        return res.status(200).json(
            new ApiResponse(200, response, "Getting all videos generated successfully")
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiError(500, "Error while processing the request"));
    }
});



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
    // console.log(videoId)

    if (!videoId) {
        throw new ApiResponse(400, "Video id is required");
    }

    const valid = isValidObjectId(videoId);
    if(!valid){
        throw new ApiError(400 , "Not a valid videoId");
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
                "owner.avatar": 1,
                videoFile:1,
                thumbnail:1
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
    const {title , description , isPublished} = req.body;
    
    console.log(req)

    if(!videoId){
        throw new ApiError(400 , "Video is is required");
    }

    if(!title || !description){
        throw new ApiError(400 , "Title and description is required");
    }


    const oldVideo = await Video.findById(videoId);
    if(!oldVideo){
        throw new ApiError(400 , "Video dont exist");
    }


    if(!oldVideo.owner._id.equals(req.user._id)){
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
                isPublished
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


const updateThumbnail = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiResponse(400 , "VdeoId is requried");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400 , "Video not found");
    }
    
    if(!video.owner._id.equals(req.user._id) ){
        throw new ApiError(400 , "Video doesnot belong to the user");
    }

    const fileLocalPath  = req.file?.path;
    if(!fileLocalPath){
        throw new ApiError(400 , "Thumbnail is required");
    }

    const thumbnail = await uploadToCloudinary(fileLocalPath);

    if(!thumbnail.url){
        throw new ApiError(500 , "Error while uploading file to cloudinary");
    }

    video.thumbnail = thumbnail.url;
    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "THumbnail changes successfully"
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

const getAllVideosByUserId = asyncHandler(async(req,res) =>{
    const {userId} = req.params;
    if(!userId){
        throw new ApiError(400 , "user id is required");
    }
    
    const validity = isValidObjectId(userId);
    if(!validity){
        throw new ApiError(400 , "User id is ot valid");
    }

    const videos = await Video.find(
        {
            owner:userId
        }
    );

    if(!videos){
        throw new ApiError(500 , "Error while getting videos from the database");
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

const incrementView = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400 , "Video id is required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400 , "Video not found");
    }

    let numberOfViews = video.views;
    numberOfViews += 1;
    video.views = numberOfViews;
    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "View incremented successfully"
        )
    )
})

const searchVideos = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query) {
        throw new ApiError(400, "Search query is required");
    }

    const regex = new RegExp(query, 'i'); // 'i' makes it case-insensitive

    // Use $or to match either name or description
    const matchingVideos = await Video.find({
        $or: [
            { title: { $regex: regex } },
            { description: { $regex: regex } }
        ]
    }).populate('owner', 'fullName username avatar');;

    return res.status(200).json(
        new ApiResponse(
            200,
            matchingVideos ,
            "Search successful"
        )
    );
});




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideosByUserId,
    updateThumbnail,
    incrementView,
    searchVideos
}