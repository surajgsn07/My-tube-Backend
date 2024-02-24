import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    // channel id lo✅
    // validate kro..aisa channel hai v ya ni✅
    // jo unsubscribe kr rha h uski id lo.✅
    // validate kro vo user ya v ya ni✅
    // subcription model mw dhundo usne subscribe ki undono ki id se koi dicument hai bhi ya nhi.✅
    // agr hai - to fr delte krdo✅
    // agr nhi h to bnado ✅
    // response send krdo with subscription document.✅
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400 , "Channel id is required");
    }

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(400 , "Channel dont exist");
    }

    const subscriber = await User.findById(req.user?._id);

    if(!subscriber){
        throw new ApiError(400 , "User dont exist");
    }
    
    const subscribed = await Subscription.findOne(
        {
            channel:channel._id,
            subscriber:subscriber._id
        }
    );

    let response = null;
    let sub = false;

    if(subscribed){
        response = await Subscription.deleteOne(
            {
                channel:channel._id,
                subscriber:subscriber._id

            }
        );
    }else{
        response = await Subscription.create(
            {
                channel:channel._id,
                subscriber:subscriber._id
            }
        );
        sub = true;
    }

    response.sub = sub;


    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Toggled successfully"
        )
    )
    

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400 , "Channel id is required");
    }

    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(400 , "No such channel exist");
    }

    const subscribers  = await Subscription.find(
        {channel : channel._id}
    ).populate({
    path: 'subscriber',
    select: 'username email avatar',
    });
    
    if(!subscribers){
        throw new ApiError(500,"Something went wrong while fetching the subscribers");
    }

    const response = subscribers.map(subscriber => subscriber.subscriber)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Subscribers are fetched"
        )
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // take channel id
    // verify it
    // dekho ye user hai bhi ya nhi
    // subscriber model me dekho kitne documents me vo as a subscriber hai. 
    // validate kro
    // response send krdo
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(400 , "subscriber id is required");
    }

    const subscriber = await User.findById(subscriberId);
    if(!subscriber){
        throw new ApiError(400 , "User not found");
    }

    const channels = await Subscription.find(
        {subscriber:subscriber._id}
    ).populate(
        {
            path:"channel",
            select:"username email avatar"
        }
    );

    if(!channels){
        throw new ApiError(500 , "something went wrong while getting data from the database")
    }

    const response = channels.map(channel => channel.channel);
    if(!response){
        throw new ApiError(500 , "something went wrong while fetching channels")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Channels found successfully"
        )
    )


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}