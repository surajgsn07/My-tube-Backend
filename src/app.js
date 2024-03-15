import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
const app = express()

app.use(cors({
    origin: 'https://watch-it-surajgsn.netlify.app',
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded());
app.use(express.static("public"))
app.use(cookieParser());

//routes import 
import userRouter from './routes/user.routes.js'
import videoRouter from "./routes/video.routes.js"
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likeRouter from "./routes/like.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import commentRouter from "./routes/comment.routes.js"

// routes declaration
app.use("/api/v1/users" , userRouter);
app.use("/api/v1/video" , videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/comment", commentRouter);



export {app} 