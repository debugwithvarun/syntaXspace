import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {   
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    languageId: { type: String, required: true },
    stdin: { type: String },
    stdout: { type: String },
    stderr: { type: String },
    time: { type: String },
    isError: { type: Boolean, required: true },

    likes: { type: [String], default: [] },

    comment: {
          type: [{userID: String, username: {type:String,required:true,trim:true},likes:{type:[String],default:[]}, text:{type:String,trim:true},replies:[{username:String,text:String,likes:{type:[String],default:[]},userID:String}], createdAt:{type:Date,default:Date.now} }],
      default: []
    }
  },
  { timestamps: true }  
);

const Post = mongoose.model("Post", postSchema);

export default Post;
