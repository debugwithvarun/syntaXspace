import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {   
        // token:{type:string},
        code:{type:String,required:true},
        title:{type:String,required:true},
        description:{type:String,required:true},
        language:{type:String,required:true},
        languageId:{type:String,required:true},
        stdin:{type:String},
        stdout:{type:String},
        stderr:{type:String},
        time:{type:String},
        isError:{type:Boolean,required:true}
    }
)

const Post = mongoose.model("Post",postSchema);

export default Post;