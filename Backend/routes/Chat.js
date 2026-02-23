import express from "express";
import User from "../models/User.js";


const chatRouter =express.Router();

chatRouter.route("/user").get((req,res)=>{
    const {Data} = req.data;
    try{
        User.findOne({username:Data.username},{followers:1,following:1}).then((result)=>{
            if(result){
                const users={...result.followers,...result.following}
                return res.status(200).json({info:users})
            }
            else{
                return res.status(404).json({msg:"User not found"})
            }
        })

    }catch(error){
        console.error("Error fetching user data:", error);
        return res.status(500).json({ msg: "Server Error" });
    }
})

export default chatRouter;