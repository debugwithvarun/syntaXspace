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
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Find user by username OR email
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    console.log("routes/User.js line : 109\n ",user)
    // 🔥 FIX: include _id in token
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username
      },
      process.env.SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,

      secure: false, // set true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      token,  // FIX 7b: Include token in body so frontend can store in localStorage
      userInfo: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profilepic: user.profilepic
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

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

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ msg: "User not exist" });
    }

    let skillsArray = [];
    try {
      skillsArray = JSON.parse(data.skills);
    } catch {
      skillsArray = [];
    }

    const updateData = {
      username: data.username,
      name: data.name,
      bio: data.bio,
      skills: skillsArray,
    };


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

    const result = await User.updateOne({ username }, { $set: updateData });

    if (result.matchedCount > 0) {
      return res.status(200).json({ msg: "Profile Update Successfully", profile: `http://localhost:8000${updateData.profilepic}` });
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
    return res.status(500).json({ msg: "Something went wrong" });
  }
});




/* =========================================================
   BLOCK / UNBLOCK
========================================================= */

Userrouter.put("/block/:targetId", verifyToken, async (req, res) => {
  try {
    const { _id: myId } = req.data;
    const { targetId } = req.params;

    if (myId === targetId)
      return res.status(400).json({ msg: "Cannot block yourself" });

    await User.updateOne({ _id: myId }, { $addToSet: { block: targetId } });
    return res.status(200).json({ msg: "User blocked" });
  } catch (error) {
    console.error("Block error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
});

Userrouter.put("/unblock/:targetId", verifyToken, async (req, res) => {
  try {
    const { _id: myId } = req.data;
    const { targetId } = req.params;

    await User.updateOne({ _id: myId }, { $pull: { block: targetId } });
    return res.status(200).json({ msg: "User unblocked" });
  } catch (error) {
    console.error("Unblock error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
});

Userrouter.get("/blocked-users", verifyToken, async (req, res) => {
  try {
    const { _id: myId } = req.data;

    const user = await User.findById(myId, { block: 1 }).populate(
      "block",
      "name username profilepic"
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    return res.status(200).json({ success: true, data: user.block });
  } catch (error) {
    console.error("Get blocked users error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default Userrouter;