import mongoose from "mongoose"

const newsSchema = new  mongoose.Schema(
    {
        headline:{ type: String, required: true, trim: true },
        desc:{ type: String, required: true, trim: true },
        author:{ type: String, required: true, trim: true }
    }
)

const News = mongoose.model("News",newsSchema)

export default News;