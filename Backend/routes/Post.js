import express from "express";
import dotenv from "dotenv";
import Post from "../models/Post.js";
import User from "../models/User.js";

dotenv.config();

const PostRouter = express.Router();

const url = "https://judge0-ce.p.rapidapi.com";
const judgeapikey = process.env.JUDGEAPIKEY;
const judgeapihost = process.env.JUDGEAPIHOST;

const toBase64 = (s = "") => Buffer.from(s, "utf8").toString("base64");
const fromBase64 = (b = "") => Buffer.from(b, "base64").toString("utf8");

PostRouter.route("/run-code").post(async (req, res) => {
  try {
    // console.log(req.body);

    const { language_id, source_code, stdin } = req.body;

    const response = await fetch(
      `${url}/submissions?base64_encoded=true&wait=true&fields=*`,
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": judgeapikey,
          "x-rapidapi-host": judgeapihost,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id,
          source_code: toBase64(source_code),
          stdin: toBase64(stdin),
        }),
      }
    );

    const data = await response.json();

    const decoded = {
      // token: data.token,
      // status: data.status?.description || "",
      time: data.time || "",
      stdout: data.stdout ? fromBase64(data.stdout) : "",
      stderr: data.stderr ? fromBase64(data.stderr) : "",
      // compile_output: data.compile_output
      //   ? fromBase64(data.compile_output)
      //   : "",
    };

    return res.status(200).json(decoded);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something Went Wrong!" });
  }
});


PostRouter.route("/save-post").post(async (req, res) => {
  try {
    const { code, language, languageId, stdin, stdout, stderr, time } = req.body;
    const { username } = req.data;
    const isError = stderr.trim() === "" ? false : true
    const NewPost = new Post({ code, language, languageId, stdin, stdout, stderr, time, isError })
    const savedPost = await NewPost.save()

    await User.updateOne(
      { username: username },
      { $push: { post: savedPost._id.toString() } }
    );

    return res.status(200).json({msg:"Code Post Successfull"})
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg:"Internal Server Error"})
  }
})
export default PostRouter;
