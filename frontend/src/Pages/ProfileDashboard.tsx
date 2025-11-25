import NewNavbar from "@/components/navbar/NewNavbar"
import VerifyEmail from "@/components/navbar/VerifyEmail"
import LeftSection from "@/components/profile/LeftSection/LeftSection"
// import ProfileCard from "@/components/profile/LeftSection/ProfileCard"
import RightSection from "@/components/profile/RightSection/RightSection"

// import { useParams } from "react-router-dom"


const ProfileDashboard = () => {
  // const {target_user}=useParams()
  return (
  <div className="w-full h-screen bg-(--color-background) flex flex-col overflow-hidden">
    {/* <Navbar /> */}
    <NewNavbar/>
    <VerifyEmail />
    <div className="w-full h-full bg-(--color-muted) flex max-sm:flex-col px-4 md:px-6 gap-4 justify-between">

        <LeftSection/>
        <RightSection/>
    </div>
  </div>
  )
}

export default ProfileDashboard