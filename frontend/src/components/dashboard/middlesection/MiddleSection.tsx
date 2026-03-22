import { ScrollArea } from "@/components/ui/scroll-area";
import PostCard from "./PostCard";
import { useEffect, useState } from "react";
import usePop from "@/hooks/usePop";
import { apiFetch } from "@/lib/api";

export type PostSummary = {
  _id: string
  title: string
  description: string
  commentCount: number
  isError:boolean
  likes: string[]
  username: string
  profilepic:string
  owner:string
  likes_count: number
  timeLabel: string
  language: string
  
}

export type Feed = {
  _id: string
  title: string
  description: string
  commentCount: number
  likes: string[]
  isError:boolean
  username: string
  profilepic:string
  name:string
  likes_count: number
  timeLabel: string
  language: string

}
const MiddleSection = () => {
  const [feed,setFeed]=useState<Feed[]>([])
  const {setMsg,setPopUp}=usePop()

  useEffect(()=>{
    try {
      const fetchData=async()=>{
        const res = await apiFetch("/syntaxspace/feed")
        if(!res.ok){
          setMsg("Failed to fetch feed")
          setPopUp("de")
          return
        }
        const data=await res.json()
        // console.log(data)
        setFeed(data.data)
      }
      fetchData()
    } catch (error) {
      setMsg("Network Error!")
      setPopUp("de")
      console.log(error)
    }
  },[])

  // console.log("feed :",feed)
  return (
    <ScrollArea
      className="
        h-full w-full px-6 mb-10 
        overflow-y-auto
        scroll-smooth
        overscroll-y-auto
      "
      style={{
        scrollBehavior: "smooth",
      }}
    >
      <div className="pt-10 flex flex-col gap-4 pb-[30vh]">
        {/* extra bottom space so last card is fully visible */}
        {feed.length===0 && (<p className="text-center mt-10 text-sm text-muted-foreground">No posts to show in feed.</p>
        )}
        {feed.map((post)=>( 
          <PostCard
            key={post._id}
            _id={post._id}
            isError={post.isError}
            title={post.title}
            description={post.description}
            commentCount={post.commentCount}
            likes={post.likes}
            username={post.username}
            profilepic={post.profilepic}
            owner={post.name}
            likes_count={post.likes_count}
            timeLabel={post.timeLabel}
            language={post.language}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default MiddleSection;
