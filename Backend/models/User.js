import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    follower: { type: [{ username: String, name: String, profilepic:String }], default: [] },
    following: { type: [{ username: String, name: String, profilepic:String }], default: [] },
    skills: { type: [String], default: [] },
    profilepic: { type: String, default: "" },
    bio: { type: String, default: "" },
    website: { type: String, default: "" },
    phoneno: { type: String, default: "" },
    location: { type: String, default: "" },
    dob: { type: String, default: "" },
    pronouns: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    deleteRequestedAt: { type: Date, default: null },
    post:{type:[Schema.Types.ObjectId],default:[]}
  },
  { timestamps: true }
);


const User = mongoose.model("User", UserSchema);
export default User;
