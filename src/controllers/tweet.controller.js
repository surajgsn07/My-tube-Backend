import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    const user = await User.findById(req.user?.id);

    if(!content){
        throw new ApiError(400 , "Content is required");
    }

    if(!user){
        throw new ApiError(400 , "User not authenticated");
    }

    const tweet = await Tweet.create({
        content,
        owner:user._id
    })

    if(!tweet){
        throw new ApiError(500 , "Something went wrong with the tweet creation");
    }

    res.status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet published successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // user lo res.user se
    // verify kro
    // ab dekho kis kis tweet me vo user h
    // response send krdo

    const {username} = req.params;

    if(!username.trim()){
        throw new ApiError(400 , "Username is required");
    }

    const user = await User.findOne({
        username
    });

    if(!user){
        throw new ApiError(400 , "User dont exist");
    }
    const tweets = await Tweet.aggregate([
        {
          $match: {
            owner: user._id
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  username: 1,
                  fullName: 1,
                  avatar: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            owner: { $arrayElemAt: ["$owner", 0] }
          }
        },
        {
          $project: {
            content: 1,
            _id: 1,
            owner: 1
          }
        }
      ]);
      
    console.log(tweets);


    if(!tweets){
        throw new ApiError(400 , "Tweets not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200 , 
            tweets,
            "Tweets fetched successfully "
        )
    )
})


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;
    console.log(req.body);
    if(!tweetId){
        throw new ApiError(400 , "Tweet Id is required");
    }

    if(!content){
        throw new ApiError(400 , "content is required");
    }

    const oldTweet = await Tweet.findById(tweetId);
    console.log(oldTweet.owner);
    console.log(req.user._id);
    if(String(oldTweet.owner) !== String(req.user._id)){
        throw new ApiError(400 , "tweet doesnot belong to the user")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    );

    console.log(tweet);

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    )
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400 , "Tweet Id is required");
    }

    
    const oldTweet = await Tweet.findById(tweetId);
    if(String(oldTweet.owner) !== String(req.user._id)){
        throw new ApiError(400 , "tweet doesnot belong to the user")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet deleted successfully"
        )
    )
})

const getTweetById = asyncHandler(async(req,res) =>{
    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400 , "TweetId is required");
    }

    const validity = isValidObjectId(tweetId);
    if(!validity){
        throw new ApiError(400 , "Tweet id is not a valid object");
    }

    const tweet = await Tweet.findOne(
        {
            _id:tweetId
        }
    );

    if(!tweet){
        throw new ApiError(500 , "Something happened while getting tweet from the database");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet fetched successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweetById
}