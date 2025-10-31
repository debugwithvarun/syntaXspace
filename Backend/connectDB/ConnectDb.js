import mongoose from "mongoose";

const ConnectDb=async(DATABASE_URL)=>{
    try {
        await mongoose.connect(DATABASE_URL)
    } catch (error) {
        console.log(error)
    }
}

export default ConnectDb