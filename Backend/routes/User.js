import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import Network from "../models/Network.js";
import { upload } from "../Function/Upload.js";
import verifyToken from "../middleware/verifyToken.js";
import fs from "fs"
import path from "path"

const Userrouter = express.Router();


Userrouter.route("/user").post(async (req, res) => {
    try {

        const { name, email, username, password } = req.body;

        // for if any data is missing 
        if (!name || !email || !username || !password) {
            const errors = {};
            if (!name) errors.name = "Name is required";
            if (!email) errors.email = "Email is required";
            if (!username) errors.username = "Username is required";
            if (!password) errors.password = "Password is required";

            return res.status(400).send(errors);
        }

        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hashpassword) => {


                const newUser = new User({
                    name: name,
                    email: email,
                    password: hashpassword,
                    username: username
                })
                const result = await newUser.save()
                console.log(result)
                const UserNetwork = new Network({ username: username })
                await UserNetwork.save()
                res.status(201).json(result)
            })
        })


    } catch (error) {
        console.log(error)
    }


}).get(async (req, res) => {


    const { username } = req.query

    const getUser = await User.findOne({ username: username }, { username: 1 })
    // console.log(getUser) 
    if (getUser !== null) {
        return res.status(409).json({ result: false })
    }
    else {
        return res.status(200).json({ result: true })
    }

})


Userrouter.get("/check_email", async (req, res) => {
    const { email } = req.query


    const check = await User.findOne({ email: email }, { email: 1, _id: 0 })
    if (check !== null) {
        return res.status(409).json({ result: false })
    }
    else {
        return res.status(200).json({ result: true })
    }
})

Userrouter.route("/login").post(async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body
        const hashpassword = await User.findOne({ username: usernameOrEmail }, { password: 1 })
        if (hashpassword?._id) {
            const getInfo = await User.findOne({ username: usernameOrEmail }, { username: 1, email: 1, name: 1,profilepic:1,_id:0 })
            bcrypt.compare(password, hashpassword.password, (err, result) => {

                if (result) {
                    let token = jwt.sign({ username: usernameOrEmail }, process.env.SECRET)
                    res.cookie("token", token, {
                        httpOnly: true,                          //  prevents JS access (security)
                        secure: false,                          //  only send over HTTPS in prod
                        sameSite: "Strict",                    //  CSRF protection
                        maxAge: 24 * 60 * 60 * 1000,          //  60*60*100 is 1 hour
                    });

                    return res.status(200).json({ msg: "Correct id and password.", code: 1, userInfo: getInfo })
                }
                else {

                    return res.status(401).json({ msg: "incorrect password", code: 2 })
                }
            })
        }
        else {

            return res.status(401).json({ msg: "Username not exist", code: 3 })
        }
    } catch (error) {
        console.log("error", error)
    }
})

Userrouter.route("/logout").post((req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: true,
            secure: false
        });
        return res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
    }
})





Userrouter.route("/setting/profile").put(verifyToken, upload.single("profilepic"), async (req, res) => {
    try {
      const { username } = req.data;
      const data = req.body;

      // 1️⃣ Find user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ msg: "User not exist" });
      }

      // 2️⃣ Parse skills safely
      let skillsArray = [];
      try {
        skillsArray = JSON.parse(data.skills);
      } catch {
        skillsArray = [];
      }

      // 3️⃣ Build update data
      const updateData = {
        username: data.username,
        name: data.name,
        bio: data.bio,
        skills: skillsArray,
      };

      // 4️⃣ Handle profile picture update
    
      if (req.file) {
        const newPicPath = `/profilepic/${req.file.filename}`;

     
        if (user.profilepic) {
          const oldPath = path.join("Public", user.profilepic);
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            //   console.log(`🗑️ Deleted old image: ${oldPath}`);
            } catch (err) {
              console.warn("⚠️ Failed to delete old image:", err.message);
            }
          }
        }

        updateData.profilepic = newPicPath;
      }

      // 5️⃣ Update the user document in one query
      const result = await User.updateOne({ username }, { $set: updateData });

      if (result.matchedCount > 0) {
        return res.status(200).json({ msg: "Profile Update Successfully",profile:`http://localhost:8000${updateData.profilepic}` });
      } else {
        return res.status(404).json({ msg: "User not exist" });
      }
    } catch (error) {
      console.error("❌ Error in /setting/profile PUT:", error);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }).get(verifyToken, async (req, res) => {
    try {
      const { username } = req.data;
      const user = await User.findOne(
        { username },
        { bio: 1, skills: 1, _id: 0 }
      );

      if (!user) {
        return res.status(404).json({ msg: "user not exist" });
      }

      return res.status(200).json({ data: user });
    } catch (error) {
    //   console.error("❌ Error in /setting/profile GET:", error);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  });



Userrouter.route("/setting/personal").put(verifyToken, async (req, res) => {
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
  }).get(verifyToken, async (req, res) => {
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
      console.error("❌ Error fetching personal details:", error);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  });
  

Userrouter.route("/setting/security").put(verifyToken, async (req, res) => {
    try {
      const { username } = req.data;
      const { currentPassword, newPassword, confirmPassword } = req.body;
  
      // 1️⃣ Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ msg: "All password fields are required" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ msg: "New passwords do not match" });
      }
  
      // 2️⃣ Find user and verify current password
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: "Current password is incorrect" });
      }
  
      // 3️⃣ Hash and update new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await User.updateOne({ username }, { $set: { password: hashedPassword } });
  
      // 4️⃣ Clear auth token to force re-login
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


  Userrouter.route("/setting/delete").delete(verifyToken, async (req, res) => {
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
  
      // 1️⃣ Remove this user from all other users' followers/following
      await User.updateMany(
        { "follower.username": username },
        { $pull: { follower: { username } } }
      );
      await User.updateMany(
        { "following.username": username },
        { $pull: { following: { username } } }
      );
  
      // 2️⃣ Remove from all Network request arrays
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
  

export default Userrouter;