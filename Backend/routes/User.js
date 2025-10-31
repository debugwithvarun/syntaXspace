import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import Network from "../models/Network.js";

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
                const UserNetwork=new Network({username:username})
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
            const getInfo=await User.findOne({username:usernameOrEmail},{username:1,email:1,name:1})
            bcrypt.compare(password, hashpassword.password, (err, result) => {

                if (result) {
                    let token = jwt.sign({ username: usernameOrEmail }, process.env.SECRET)
                    res.cookie("token", token, {
                        httpOnly: true,                          //  prevents JS access (security)
                        secure: false,                          //  only send over HTTPS in prod
                        sameSite: "Strict",                    //  CSRF protection
                        maxAge: 24 * 60 * 60 * 1000,          //  60*60*100 is 1 hour
                    });
                    
                    return res.status(200).json({ msg: "Correct id and password.", code: 1,userInfo:getInfo })
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

Userrouter.route("/logout").post((req,res)=>{
    try {
        res.clearCookie("token",{
            httpOnly:true,
            sameSite:true,
            secure:false
        });
        return res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
    }
})


export default Userrouter;