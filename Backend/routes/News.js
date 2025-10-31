import express from "express"
import cron from "node-cron";
import News from "../models/News.js";
import { fetchTechNews } from "../Function/FetchNews.js";


export function scheduleNewsFetching() {

    cron.schedule("30 11 * * *", async () => {
        console.log("🕚 Running scheduled fetch at 11:30 AM");
        const NewsData = await fetchTechNews();
        await News.deleteMany({})

        NewsData.forEach(async (element) => {
            const newsEntry = new News({
                headline: element.title,
                desc: element.description,
                author: element.source?.name
            })
            await newsEntry.save()
        });
    });
    
    
    cron.schedule("0 18 * * *", async () => {
        console.log("🌇 Running scheduled fetch at 6:00 PM");
        const NewsData = await fetchTechNews();
        await News.deleteMany({})
    
        NewsData.forEach(async (element) => {
            const newsEntry = new News({
                headline: element.title,
                desc: element.description,
                author: element.source?.name 
            })
            await newsEntry.save()
        });
    });
    
    console.log("🕒 Scheduler started — will run at 11:30 AM and 6:00 PM daily.");
}

export async function DirectNewsFetching(){
    const NewsData = await fetchTechNews();
    console.log(NewsData)
        await News.deleteMany({})
    
        NewsData.forEach(async (element) => {
            const newsEntry = new News({
                headline: element.title,
                desc: element.description,
                author: element.source?.name
            })
            
            await newsEntry.save()
        });
}


const NewsRouter=express.Router()

NewsRouter.route("/get-news").get(async(req,res)=>{
    try {
        const newsArticle=await News.find({},{headline:1,desc:1,author:1,_id:0})
        return res.status(200).json({article:newsArticle})
        
    } catch (error) {
        res.status(500).json({msg:"Internal Server Error"})
    }
})

export default NewsRouter;