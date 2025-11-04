// import Navbar from "@/components/Navbar"
import LeftSideSection from "@/components/dashboard/leftsection/LeftSideSection"
import VerifyEmail from "@/components/navbar/VerifyEmail"
import RightSideSection from "@/components/dashboard/rightsection/RightSideSection"
import NewNavbar from "@/components/navbar/NewNavbar"
import MiddleSection from "@/components/dashboard/middlesection/MiddleSection"



const AppDashboard = () => (
  <div className="w-full h-screen bg-(--color-background) flex flex-col overflow-hidden">
    {/* <Navbar /> */}
    <NewNavbar/>
    <VerifyEmail />
    <div className="w-full h-full bg-(--color-muted) flex max-sm:flex-col px-4 md:px-6 gap-4 justify-between">
      <LeftSideSection />
       <MiddleSection/> 
      <RightSideSection />

    </div>
  </div>
)

export default AppDashboard