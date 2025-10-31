import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password:{type:String,required: true},
    follower: { type: [{username:String,name:String}], default: [] },
    following: { type: [{username:String,name:String}], default: [] },
  },
  { timestamps: true } 
);

const User = mongoose.model("User", UserSchema);
export default User;
