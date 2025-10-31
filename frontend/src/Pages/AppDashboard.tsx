// import Navbar from "@/components/Navbar"
import LeftSideSection from "@/components/LeftSideSection"
import VerifyEmail from "@/components/VerifyEmail"
import RightSideSection from "@/components/RightSideSection"
import NewNavbar from "@/components/NewNavbar"



const AppDashboard = () => (
  <div className="w-full h-screen bg-(--color-background) flex flex-col">
    {/* <Navbar /> */}
    <NewNavbar/>
    <VerifyEmail />
    <div className="w-full h-full bg-(--color-muted) flex max-sm:flex-col px-4 md:px-6 gap-4 justify-between">
      <LeftSideSection />
      <div className="h-full  p-6 pt-10 ">

      </div>
      <RightSideSection />

    </div>
  </div>
)

export default AppDashboard