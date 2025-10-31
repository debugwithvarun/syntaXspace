import express from 'express'
import dotenv from "dotenv"
import Userrouter from './routes/User.js'
import ConnectDb from './connectDB/ConnectDb.js'
import cookieParser from 'cookie-parser'
import Authrouter from './routes/Auth.js'
import verifyToken from './middleware/verifyToken.js'
import Rcmdrouter from './routes/Rcmd.js'

import Networkrouter from './routes/Network.js'
import { DirectNewsFetching, scheduleNewsFetching } from './routes/News.js'
import NewsRouter from './routes/News.js'





// import User from './models/User.js'
// import Network from './models/Network.js'
// const makechange=async()=>{
//     const us=await User.find({},{username:1,_id:0})
//     us.forEach(async(element) => {        
//         const newUser=new Network({username:element.username})
//         await newUser.save()
        
//     });
// }
// makechange()


dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// get data from the .env
const PORT=process.env.PORT;
const DATABASE_URL=process.env.DATABASE_URL;

ConnectDb(DATABASE_URL);

app.use("/",Userrouter);
app.use("/",verifyToken,Authrouter);
app.use("/",verifyToken,Rcmdrouter)
app.use("/",verifyToken,Networkrouter)
app.use("/",verifyToken,NewsRouter)


scheduleNewsFetching()

// DirectNewsFetching()
app.listen(PORT,()=>console.log("Server Up !!"));