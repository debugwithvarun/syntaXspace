import mongoose from "mongoose";

const ConnectDb=async(DATABASE_URL)=>{
    try {
       const res = await mongoose.connect(DATABASE_URL)
       console.log(`MongoDB connected: ${res.connection.host}`)
    } catch (error) {
        console.log(error)
    }
}

export default ConnectDb