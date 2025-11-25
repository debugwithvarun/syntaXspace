import express from "express"
import Network from "../models/Network.js";
import User from "../models/User.js";

const Networkrouter=express.Router()

Networkrouter.route("/sent-request").put(async (req, res) => {
    try {
      const { target } = req.body;
      const username = req.data.username;
  
 
      const target_data = await User.findOne(
        { username: target },
        { username: 1, name: 1,profilepic:1, _id: 0 }
      );
      const sender_data = await User.findOne(
        { username: username },
        { username: 1, name: 1,profilepic:1, _id: 0 }
      );
  
 
      const senderNetwork = await Network.findOne({ username: username, "requsetSent.username": target });
      if (senderNetwork) {
        return res.status(400).json({ msg: "Request already sent to this user." });
      }
  

      const targetNetwork = await Network.findOne({ username: target, "requsetGet.username": username });
      if (targetNetwork) {
        return res.status(400).json({ msg: "You already have a pending request from this user." });
      }
  

      await Network.updateOne(
        { username: username },
        { $push: { requsetSent: target_data } }
      );
  

      await Network.updateOne(
        { username: target },
        { $push: { requsetGet: sender_data } }
      );
  
      res.status(200).json({ msg: "Invite Sent!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error!" });
    }
  });


Networkrouter.route("/check-status/:target").get(async(req,res)=>{
    const target=req.params.target;
    const {username}=req.data
   
    try {
        let status=await User.findOne({username:username,"following.username":target})
   
        if(status){
            return res.json({status:"already"})
        }
        else{
            status=await Network.findOne({ username: username, "requsetSent.username": target })
       
            if(status){
                return res.json({status:"sent"})
            }
            else{
                return res.json({status:"idle"})
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({msg:"Internal Server Error!"})
    }
})
  
Networkrouter.route("/get-sent-requests").get(async(req,res)=>{
  try {
    const {username}=req.data;

    const {requsetSent}=await Network.findOne({username:username},{requsetSent:1,_id:0})
    // console.log(requsetSent)
    res.status(200).json({msg:"okey",data:requsetSent})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:"Internal Server Error",data:[]})
  }
})

Networkrouter.route("/delete-sent-request/:username").delete(async(req,res)=>{
  try {
    const {username}=req.data
    const targetuser=req.params.username

    // Use $pull to remove the targetuser object from requsetSent array of user document
    const result1 = await Network.updateOne(
      { username: username },
      { $pull: { requsetSent: { username: targetuser } } }
    );
    const result2 = await Network.updateOne(
      { username: targetuser },
      { $pull: { requsetGet: { username: username } } }
    );
    console.log("first : ",result1)
    console.log("second : ",result2)
    return res.status(200).json({ msg: "Sent Request removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
})

Networkrouter.route("/get-recieve-requests").get(async(req,res)=>{
  try {
    const {username}=req.data;

    const {requsetGet}=await Network.findOne({username:username},{requsetGet:1,_id:0})

    res.status(200).json({msg:"okey",data:requsetGet})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:"Internal Servel Error",data:[]})
  }
})

Networkrouter.route("/delete-recieve-request/:username").delete(async(req,res)=>{
  try {
    const {username}=req.data
    const targetuser=req.params.username

    // Use $pull to remove the targetuser object from requsetSent array of user document
    const result1 = await Network.updateOne(
      { username: username },
      { $pull: { requsetGet: { username: targetuser } } }
    );
    const result2 = await Network.updateOne(
      { username: targetuser },
      { $pull: { requsetSent: { username: username } } }
    );
    console.log("first : ",result1)
    console.log("second : ",result2)
    return res.status(200).json({ msg: "Invite  removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
})
Networkrouter.route("/delete-recieve-request/:username").delete(async(req,res)=>{
  try {
    const {username}=req.data
    const targetuser=req.params.username

    // Use $pull to remove the targetuser object from requsetSent array of user document
    const result1 = await Network.updateOne(
      { username: username },
      { $pull: { requsetGet: { username: targetuser } } }
    );
    const result2 = await Network.updateOne(
      { username: targetuser },
      { $pull: { requsetSent: { username: username } } }
    );
    console.log("first : ",result1)
    console.log("second : ",result2)
    return res.status(200).json({ msg: "Invite  removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
})

Networkrouter.route("/add-receive-request/:username").put(async (req, res) => {
  try {
    const { username } = req.data;  // your current user
    const targetuser = req.params.username;


    const userData=await User.findOne({username:username},{username:1,name:1,profilepic:1,_id:0})
    const targetData=await User.findOne({username:targetuser},{username:1,name:1,profilepic:1,_id:0})
    await Network.updateOne(
      { username: username },
      { $pull: { requsetGet: { username: targetuser } } }
    );
    await Network.updateOne(
      { username: targetuser },
      { $pull: { requsetSent: { username: username } } }
    );
    await User.updateOne(
      { username: username },
      { $push: { follower: targetData } }
    );
    await User.updateOne(
      { username: targetuser },
      { $push: { following: userData } }
    );

    return res.status(200).json({ msg: "Invite accept successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

Networkrouter.route("/get-follower-info").get(async(req,res)=>{
  try {
    const {username}=req.data;

    const {follower}=await User.findOne({username:username},{follower:1,_id:0})
  
    res.status(200).json({msg:"okey",data:follower})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:"Internal Server Error",data:[]})
  }
})


Networkrouter.route("/remove-follower/:username").delete(async(req,res)=>{
  try {
    const {username}=req.data
    const targetuser=req.params.username

    // Use $pull to remove the targetuser object from requsetSent array of user document
     await User.updateOne(
      { username: username },
      { $pull: { follower: { username: targetuser } } }
    );
    await User.updateOne(
      { username: targetuser },
      { $pull: { following: { username: username } } }
    );

    return res.status(200).json({ msg: "Remove successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
})

Networkrouter.route("/get-following-info").get(async(req,res)=>{
  try {
    const {username}=req.data;

    const {following}=await User.findOne({username:username},{following:1,_id:0})
  
    res.status(200).json({msg:"okey",data:following})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:"Internal Server Error",data:[]})
  }
})

Networkrouter.route("/remove-following/:username").delete(async(req,res)=>{
  try {
    const {username}=req.data
    const targetuser=req.params.username

    // Use $pull to remove the targetuser object from requsetSent array of user document
     await User.updateOne(
      { username: username },
      { $pull: { following: { username: targetuser } } }
    );
    await User.updateOne(
      { username: targetuser },
      { $pull: { follower: { username: username } } }
    );

    return res.status(200).json({ msg: "Remove successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
})


Networkrouter
  .route("/get-network-info/:username")
  .get(async (req, res) => {
    try {
      const target_user = req.params.username

      // Get follower & following arrays only
      const user = await User.findOne(
        { username: target_user },
        { _id: 0, follower: 1, following: 1,bio:1,skills:1,post:1 }
      )

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      const followersCount = user.follower?.length || 0;
      const followingCount = user.following?.length || 0;
      const postCount=user.post?.length || 0;

      return res.status(200).json({
        success: true,
        data: {
          followersCount,
          followingCount,
          postCount,
          followers: user.follower,  
          following: user.following, 
          bio:user.bio,
          skills:user.skills 
        },
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  })
export default Networkrouter;