import { KeySquare, Mail, ShieldBan, Trash2, UserRoundCheck } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "../ui/separator"
import EditProfile from "./EditProfile"
import PersonalDetails from "./PersonalDetails"
import PasswordSecurity from "./PasswordSecurity"
import Block from "./Block"



export default function SettingInner() {

  return (
    <Tabs
      defaultValue={"tab-1"}
      orientation="vertical"
      className="w-[80%] h-full flex-row p-6 gap-0 "
    >
      <TabsList className=" items-start flex-col gap-1 rounded-xl shadow-md bg-background  h-fit  justify-start px-4  py-6 text-foreground">
        <h6 className=" pl-2 text-sm font-medium pb-1">Settings</h6>

        <Separator className="mb-2"></Separator>
        <TabsTrigger
          value="tab-1"
          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <Mail
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Edit Profile
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"

          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <UserRoundCheck
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Personal Details
        </TabsTrigger>
        <TabsTrigger
          value="tab-3"
          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <KeySquare
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Password & Security

        </TabsTrigger>
        <TabsTrigger
          value="tab-4"
          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <ShieldBan
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Blocked

        </TabsTrigger>
        <TabsTrigger
          value="tab-5"
          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <Trash2
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Delete Account

        </TabsTrigger>
      </TabsList>

      <div className="grow rounded-xl text-start  ">
        <TabsContent value="tab-1">
            <EditProfile/>
        </TabsContent>
        <TabsContent value="tab-2">
            <PersonalDetails/>
        </TabsContent>
        <TabsContent value="tab-3">
          <PasswordSecurity/>
        </TabsContent>
        <TabsContent value="tab-4">
          <Block/>
          
        </TabsContent>


      </div>
    </Tabs>
  )
}
