// import Navbar from "@/components/Navbar"
import LeftSideSection from "@/components/dashboard/leftsection/LeftSideSection"
import VerifyEmail from "@/components/navbar/VerifyEmail"
import RightSideSection from "@/components/dashboard/rightsection/RightSideSection"
import NewNavbar from "@/components/navbar/NewNavbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"



const AppDashboard = () => (
  <div className="w-full h-screen bg-(--color-background) flex flex-col overflow-hidden">
    {/* <Navbar /> */}
    <NewNavbar/>
    <VerifyEmail />
    <div className="w-full h-full bg-(--color-muted) flex max-sm:flex-col px-4 md:px-6 gap-4 justify-between">
      <LeftSideSection />
      <ScrollArea className="h-full w-full p-6  pt-10 ">
            <Card className="">

            </Card>
      </ScrollArea>
      <RightSideSection />

    </div>
  </div>
)

export default AppDashboard