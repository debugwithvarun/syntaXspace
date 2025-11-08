import jwt from "jsonwebtoken"
import express from "express"
import User from "../models/User.js";
const Authrouter=express.Router()

Authrouter.route("/check-auth").get(async(req,res)=>{
    
    try {
        const data = req.data
        const getInfo=await User.findOne({username:data.username},{username:1,email:1,name:1,profilepic:1})
    
        res.json({success:true,userInfo:getInfo})
    } catch {
        res.json({success:false})
    }
})



export default Authrouter;