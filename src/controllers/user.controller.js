import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadToCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log("accesstoken : ",accessToken );

        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave:false
        });

        return {accessToken , refreshToken};

    } catch (error) {
        throw new ApiError(500 , "Someting went wrong while generating access and refresh tokens");
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validate it : not empty
    // cheeck if user already exist : username/email
    // check for images
    //check for avatar
    // upload them to cloudinary , avatar
    // create user object
    // remove password and refreshToken from res
    // check res
    // return res

    const {fullName , username , email , password} = req.body;
    console.log(req.body)
    // console.log("email :" , email);

    if(
        [fullName , username , email ,  password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400 , "All fields are required");
    }

    const existedUser = await User.findOne({
        $or:[{ username } , { email }]
    });

    if(existedUser){
        throw new ApiError(400 , "User with email/username already existed");
    }

    // console.log(email)

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path;
    }


    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400 , "avatar is required");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400 , "avatar required");
    }

    // console.log(req.files);

    const user  = await User.create({
        fullName ,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    });
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500 , "something went wrong while registering");
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser,"User registered successfully")
    )

})

const loginUser = asyncHandler(async(req,res)=>{
    //req-body -> data
    //username email
    //find the user
    // password
    // acces and refresh token
    // send cookies
    const {email , username , password} = req.body;

    // console.log(req.body)

    if(!email && !username){
        throw new ApiError(400 , "email or username is required");
    }

    const user = await User.findOne({
        $or:[{ email } , { username }]
    });

    if(!user){
        throw new ApiError(404 , "USer doesnot exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(404 , "Password not correct");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);
    // console.log({accessToken , refreshToken});

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const option = {
        httpOnly : true,
    secure: false, 
    sameSite: 'Lax', 
    domain: 'localhost', // Set to the appropriate domain
    path: '/', // Set to the appropriate path // Set SameSite attribute
    };

    return res
            .status(200)
            .cookie("accessToken",accessToken ,option)
            .cookie("refreshToken" , refreshToken ,option)
            .json(
                new ApiResponse(
                    200 ,
                    {
                        user:loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "user logged in successfully"
                )
            )
})

const logoutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            },
        },
        {
            new:true
        }
    )

    const option = {
        httpOnly : true,
        // secure:true
    };

    return res.status(200)
    .clearCookie("accessToken",option )
    .clearCookie("refreshToken",option )
    .json(
        new ApiResponse(
            200 ,
            {},
            "User"
        )
    );

    
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;
    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken ,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "invalid refresh token");
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401 , "Refresh token iw expired or used");
        }
    
        const options = {
            httpOnly:true,
            // secure:true
        };
    
        const {accessToken , newRefreshToken}= await generateAccessAndRefreshToken(user._id);
    
        return res.status(200).cookie("accessToken" , accessToken , { sameSite: "None" } ).cookie("refreshToken" , newRefreshToken,{ sameSite: "None" }).json(
            new ApiResponse(
                200 ,
                {accessToken , refreshToken:newRefreshToken ,options },
                "access token refreshed successfully"
    
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "incalid refresh token");
    }
})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400 , "old password incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(
            200 ,
            {},
            "Password changes successfully"
        )
    )

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    // console.log(req.user)
    return res
        .status(200)
        .json(
            new ApiResponse(200 , req.user , "current user fetched successfully")
        );
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName , email} = req.body;

    if(!fullName || !email){
        throw new ApiError(400 , "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            fullName,
            email
        },
        {new:true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "User updates successfully"
        )
    );

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "avatar file is missing");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(
            400 , "Error while uploading avatar"
        )
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new:true}
    );

    return res.status(200).json(
        new ApiResponse(200 , user , "Avatar image uploaded successfully")
    )
})

const updateCoverImage = asyncHandler(async(req,res)=>{

   
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400 , "coverImage file is missing");
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(
            400 , "Error while uploading coverImage"
        )
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new:true}
    );

    return res.status(200).json(
        new ApiResponse(200 , user , "cover  image uploaded successfully")
    )
})


const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400 , "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match:{username :username?.toLowerCase()}
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user._id , "$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                avatar:1,
                isSubscribed:1,
                coverImage:1
            }
        }
    ])

    if(!channel.length){
        throw new ApiError(404 , "channel doesnot exist")
    }

    return res.status(200)
    .json(
        new ApiResponse(200  , channel[0] , "user channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])


    console.log(user)
    return res.status(200).json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
    )
})





// dont forget to write other functions in export
export  {registerUser
,loginUser
,logoutUser
,refreshAccessToken
,changePassword
,getCurrentUser,
updateAccountDetails,
updateUserAvatar,
updateCoverImage,
getUserChannelProfile,
getWatchHistory
}