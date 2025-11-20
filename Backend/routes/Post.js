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
    console.log("Judge0 raw:", data);

    // Decode all relevant fields
    const rawStdout =
      data.stdout && typeof data.stdout === "string"
        ? fromBase64(data.stdout)
        : "";
    const rawStderr =
      data.stderr && typeof data.stderr === "string"
        ? fromBase64(data.stderr)
        : "";
    const rawCompileOutput =
      data.compile_output && typeof data.compile_output === "string"
        ? fromBase64(data.compile_output)
        : "";
    const rawMessage =
      data.message && typeof data.message === "string"
        ? fromBase64(data.message)
        : "";

    const status = data.status || null;
    const statusId = status?.id ?? null;
    const statusDescription = status?.description || "";

    let finalStdout = rawStdout;
    let finalStderr = rawStderr;

    // Judge0: status.id === 3 => "Accepted"
    const isSuccess = statusId === 3;

    if (!isSuccess) {
      if (finalStderr.trim() === "" && rawCompileOutput.trim() !== "") {
        finalStderr = `${statusDescription}\n${rawCompileOutput}`.trim();
      } else if (
        finalStderr.trim() === "" &&
        rawCompileOutput.trim() === "" &&
        rawMessage.trim() !== ""
      ) {
        finalStderr = `${statusDescription}\n${rawMessage}`.trim();
      } else {
        finalStderr = `${statusDescription}\n${finalStderr}`.trim();
      }
    }
    if (isSuccess) {
      finalStderr = "";   // very important
    }
    
    const normalized = {
      time: data.time || "",
      status: data.status || null,            // { id, description }
      status_id: statusId,                    // number
      status_description: statusDescription,  // string
      stdout: finalStdout,
      stderr: finalStderr,                    // error text only (no "Accepted" here)
    };
    

    return res.status(200).json(normalized);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something Went Wrong!" });
  }
});

// --- KEEP YOUR EXISTING /save-post ROUTE AS-IS ---
// It will now work better because stderr will also contain compile errors.

PostRouter.route("/save-post").post(async (req, res) => {
  try {
    const { code, language, languageId, stdin, stdout, stderr, time,title,description } = req.body;
    const { username } = req.data;

    const isError = stderr.trim() === "" ? false : true;

    const NewPost = new Post({
      code,
      language,
      languageId,
      stdin,
      stdout,
      stderr,
      time,
      isError,
      title,
      description
    });

    const savedPost = await NewPost.save();

    await User.updateOne(
      { username: username },
      { $push: { post: savedPost._id.toString() } }
    );

    return res.status(200).json({ msg: "Code Post Successfull" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

export default PostRouter;
