import NewNavbar from "@/components/navbar/NewNavbar"
import VerifyEmail from "@/components/navbar/VerifyEmail"
import LeftSection from "@/components/profile/LeftSection/LeftSection"
import RightSection from "@/components/profile/RightSection/RightSection"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect } from "react"

const ProfileDashboard = () => {
  const { target_user } = useParams()
  const { username } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {

    if (username && target_user && username !== target_user) {
      navigate(`/profile/${username}`)
    }
  }, [username, target_user, navigate])

  // Optional: handle loading state while username/params are not ready
  if (!username || !target_user) {
    return null // or a loader component
  }

  return (
    <div className="w-full h-screen bg-(--color-background) flex flex-col overflow-hidden">
      <NewNavbar />
      <VerifyEmail />
      <div className="w-full h-full bg-(--color-muted) flex max-sm:flex-col px-4 md:px-6 gap-4 justify-between">
        <LeftSection />
        <RightSection />
      </div>
    </div>
  )
}

export default ProfileDashboard
