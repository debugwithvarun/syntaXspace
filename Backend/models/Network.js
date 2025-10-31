import mongoose from "mongoose";

const NetworkSchema=new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true, unique: true },
        requsetSent: { type: [{username:String,name:String}], default: [] },
        requsetGet: { type: [{username:String,name:String}], default: [] },
      },
      { timestamps: true } 
)

const Network = mongoose.model("Network",NetworkSchema);

export default Network;