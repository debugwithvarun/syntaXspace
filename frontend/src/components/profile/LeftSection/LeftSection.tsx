
import { ScrollArea } from '@/components/ui/scroll-area'
import ProfileCard from './ProfileCard'
import TabSection from './TabSection'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export type MiniUser = {
  username: string
  name: string
  profilepic?: string
}

export type NetworkStats = {
  followersCount: number
  followingCount: number
  postCount: number
  followers: MiniUser[]
  following: MiniUser[]
  bio?:string
  skills?:string[]
}

const LeftSection = () => {
  const { name, profilepic, username } = useAuth()


  const [loadingStats, setLoadingStats] = useState(true)
    const [networkStats, setNetworkStats] = useState<NetworkStats>({
      followersCount: 0,
      followingCount: 0,
      postCount:0,
      followers: [],
      following: [],
      bio: "",
      skills: [],
    })

    useEffect(() => {
      const fetchNetworkInfo = async () => {
        if (!username) return
  
        try {
          const res = await fetch(`/api/get-network-info/${username}`)
          const data = await res.json()
          // console.log("Network info:", data)
          if (data.success && data.data) {
            setNetworkStats({
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
    }, [username])
  
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
      
        <ProfileCard name={name} profilepic={profilepic} networkStats={networkStats} loadingStats={loadingStats} username={username}/>
        <TabSection postCount={networkStats.postCount} />
      </div>
    </ScrollArea>





  )
}

export default LeftSection