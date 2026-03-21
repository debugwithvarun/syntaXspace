import express from "express"
import User from "../models/User.js";
import Network from "../models/Network.js";
import bcrypt from "bcrypt"
import fs from "fs"
import path from "path"

export const ProfileRouter=express.Router()

ProfileRouter.route("/setting/personal").put( async (req, res) => {
    try {
      const { username } = req.data;
      const { email, phoneno, website, location, dob, pronouns } = req.body;
  
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ msg: "User not found" });
  
      const updateData = {
        email,
        phoneno,
        website,
        location,
        dob,
        pronouns,
      };
  
      const result = await User.updateOne({ username }, { $set: updateData });
  
      if (result.modifiedCount > 0) {
        return res.status(200).json({ msg: "Personal details updated successfully" });
      } else {
        return res.status(200).json({ msg: "No changes made" });
      }
    } catch (error) {
      console.error("❌ Error updating personal details:", error);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }).get( async (req, res) => {
    try {
      const { username } = req.data;
  
      const user = await User.findOne(
        { username },
        {
          email: 1,
          phoneno: 1,
          website: 1,
          location: 1,
          dob: 1,
          pronouns: 1,
          _id: 0,
        }
      );
  
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      return res.status(200).json({ data: user });
    } catch (error) {
      console.error("Error fetching personal details:", error);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  });
  

ProfileRouter.route("/setting/security").put (async (req, res) => {
    try {
      const { username } = req.data;
      const { currentPassword, newPassword, confirmPassword } = req.body;
  
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ msg: "All password fields are required" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ msg: "New passwords do not match" });
      }
  
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: "Current password is incorrect" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await User.updateOne({ username }, { $set: { password: hashedPassword } });
  
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: true,
        secure: false,
      });
  
      return res.status(200).json({ msg: "Password updated successfully. Please log in again." });
    } catch (error) {
      console.error("❌ Error updating password:", error);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  });  


  ProfileRouter.route("/setting/delete").delete( async (req, res) => {
    try {
      const { username } = req.data;
      const { password } = req.body;
  
      if (!password) {
        return res.status(400).json({ msg: "Password is required" });
      }
  
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: "Incorrect password" });
      }
  
      // 1️⃣ Remove this user from all other users' followers/following (ID-based)
      await User.updateMany(
        { follower: user._id },
        { $pull: { follower: user._id } }
      );
      await User.updateMany(
        { following: user._id },
        { $pull: { following: user._id } }
      );
  
      // 2️⃣ Remove from all Network request arrays (username-based, Network still uses objects)
      await Network.updateMany(
        { "requsetSent.username": username },
        { $pull: { requsetSent: { username } } }
      );
      await Network.updateMany(
        { "requsetGet.username": username },
        { $pull: { requsetGet: { username } } }
      );
  
      // 3️⃣ Delete this user's network entry
      await Network.deleteOne({ username });
  
      // 4️⃣ Delete profile picture if exists
      if (user.profilepic) {
        const oldPath = path.join("Public", user.profilepic);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.warn("⚠️ Failed to delete old profile image:", err.message);
          }
        }
      }
  
      // 5️⃣ Delete the user account itself
      await User.deleteOne({ username });
  
      // 6️⃣ Clear cookies & confirm deletion
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: true,
        secure: false,
      });
  
      return res.status(200).json({
        msg: "Account permanently deleted along with all linked data.",
      });
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  });
  

  ProfileRouter.route("/get-about-info/:username").get(async (req, res) => {
    try {
      const { username } = req.params
  
      const user = await User.findOne(
        { username },
        {
          _id: 1,
          name: 1,
          username: 1,
          bio: 1,
          skills: 1,
          website: 1,
          phoneno: 1,
          location: 1,
          dob: 1,
          pronouns: 1,
          profilepic: 1,
        }
      )
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }
  
      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      console.error(" Error in /get-about-info:", error)
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      })
    }
  })
  