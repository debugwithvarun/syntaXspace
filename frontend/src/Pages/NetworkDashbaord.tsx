// import Navbar from "@/components/Navbar"
import VerifyEmail from "@/components/VerifyEmail"
import NewNavbar from "@/components/NewNavbar"
import NetworkPageInner from "@/components/Network/NetworkPageInner";



const NetworkDashbaord = () => (
  <div className="w-full h-screen bg-(--color-background) flex flex-col">
    {/* <Navbar /> */}
    <NewNavbar/>
    <VerifyEmail />
    <div className="w-full h-full bg-(--color-muted) flex justify-center relative">
        <NetworkPageInner/>
    </div>
  </div>
)

export default NetworkDashbaord;