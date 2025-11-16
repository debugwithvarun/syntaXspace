import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {   
        token:{type:string},
        source_code:{type:String,required:true},
        input:{type:String},
        output:{type:String},
        error:{type:String},
        time:{type:String},
        isError:{type:Boolean,required:true}
    }
)

const Post = mongoose.model("Post",postSchema);

export default Post;