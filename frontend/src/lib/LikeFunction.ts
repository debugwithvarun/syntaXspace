
import { apiFetch } from "./api";

// requre 
// 1. e 
// 2. _id
// 3. setIsLiked
// 4. setLikeCount
// 5. setLiked

  export const handleLikeClick = async ({e,_id,setIsLiked,setLikeCount,setLiked}: {e: React.MouseEvent<HTMLSpanElement>, _id: string, setIsLiked: React.Dispatch<React.SetStateAction<boolean>>, setLikeCount: React.Dispatch<React.SetStateAction<number>>, setLiked: React.Dispatch<React.SetStateAction<string[]>>}) => {
    e.stopPropagation()

    const res = await apiFetch(`/syntaxspace/post-like/${_id}`, { method: 'POST' })
    const data=await res.json()
    const next=data.liked

    setIsLiked(next)  
    setLikeCount((prevCount) => next ? prevCount + 1 : prevCount === 0 ? 0 : prevCount - 1)
    setLiked(data.likes)
  }