
import { ScrollArea } from '@/components/ui/scroll-area'
import ProfileCard from './ProfileCard'
import TabSection from './TabSection'
import { useEffect, useState } from 'react'
import ImagePath from '@/lib/ImagePath'
import { apiFetch } from '@/lib/api'

export type MiniUser = {
  username: string
  name: string
  profilepic?: string
}

export type NetworkStats = {
  username:string
  profilepic:string
  name:string
  verified:boolean
  followersCount: number
  followingCount: number
  postCount: number
  followers: MiniUser[]
  following: MiniUser[]
  bio?:string
  skills?:string[]
}

const LeftSection = ({target_user}:{target_user:string}) => {



  const [loadingStats, setLoadingStats] = useState(true)
    const [networkStats, setNetworkStats] = useState<NetworkStats>({
      followersCount: 0,
      followingCount: 0,
      postCount:0,
      verified:false,
      username:target_user,
      profilepic:"",
      name:"",
      followers: [],
      following: [],
      bio: "",
      skills: [],
    })

    useEffect(() => {
      const fetchNetworkInfo = async () => {
        if (!target_user) return
  
        try {
          const res = await apiFetch(`/get-network-info/${target_user}`)
          const data = await res.json()
          if (data.success && data.data) {
            setNetworkStats({
              verified:data.data.verified || false,
              profilepic:ImagePath(data.data.profilepic) || "",
              name:data.data.name || "",
              username:data.data.username || target_user,
              followersCount: data.data.followersCount || 0,
              followingCount: data.data.followingCount || 0,
              postCount:data.data.postCount || 0,
              followers: data.data.followers || [],
              following: data.data.following || [],
              bio: data.data.bio || "",
              skills: data.data.skills || [],
            })
          }
        } catch (error) {
          console.error("Failed to fetch network info:", error)
        } finally {
          setLoadingStats(false)
        }
      }
  
      fetchNetworkInfo()
    }, [target_user])
  
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
      <div className="pt-10 flex flex-col gap-4 pb-[22vh]">
      
        <ProfileCard  networkStats={networkStats} loadingStats={loadingStats} />
        <TabSection postCount={networkStats.postCount} username={target_user}/>
      </div>
    </ScrollArea>





  )
}

export default LeftSection