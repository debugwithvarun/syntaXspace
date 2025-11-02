// import Navbar from "@/components/Navbar"
import VerifyEmail from "@/components/navbar/VerifyEmail"
import NewNavbar from "@/components/navbar/NewNavbar"
import SettingInner from "@/components/settings/SettingInner";




const Setting = () => (
  <div className="w-full h-screen bg-(--color-background) flex flex-col">

   <div className="w-full sticky top-0 z-20">
   <NewNavbar/>
    <VerifyEmail />
   </div>
    <div className="w-full h-full bg-(--color-muted) flex justify-center overflow-hidden">
        <SettingInner/>
    </div>
  </div>
)

export default Setting;