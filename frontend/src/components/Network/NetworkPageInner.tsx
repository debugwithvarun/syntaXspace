import { Mail, Rss, UserRoundCheck } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Invite from "./Invite"
import { Separator } from "../ui/separator"
import Followers from "./followers"
import Following from "./following"
import { useNetwork } from "@/hooks/useNetwork"
import { useEffect } from "react"


export default function NetworkPageInner() {
  const { tabValue, setTabValue } = useNetwork()
  useEffect(() => {
    console.log(tabValue)
  }, [tabValue])
  return (
    <Tabs
      defaultValue={tabValue}
      orientation="vertical"
      className="w-[80%] h-full flex-row p-6 gap-6 "
    >
      <TabsList className="flex-col gap-1 rounded-xl shadow-md bg-background  h-fit  justify-start px-4 py-6 text-foreground">
        <h6 className="pr-8 text-sm font-medium pb-1">Manage My Network</h6>

        <Separator className="mb-2"></Separator>
        <TabsTrigger
          onClick={() => setTabValue("tab-1")}
          value="tab-1"
          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <Mail
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Invite
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          onClick={() => setTabValue("tab-2")}

          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <UserRoundCheck
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Followers
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setTabValue("tab-3")}

          value="tab-3"
          className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary data-[state=active]:hover:bg-accent"
        >
          <Rss
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Following

        </TabsTrigger>
      </TabsList>

      <div className="grow rounded-xl text-start  ">
        <TabsContent value="tab-1">
          <Invite />
        </TabsContent>
        <TabsContent value="tab-2">
          <Followers />
        </TabsContent>
        <TabsContent value="tab-3">
          <Following />
        </TabsContent>
      </div>
    </Tabs>
  )
}
