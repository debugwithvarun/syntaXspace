import { HeartHandshake, Send } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "../ui/separator"
import { ProfileSent } from "./ProfileSent"
import { ProfileRecieve } from "./ProfileRecieve"


export default function Invite() {
  return (
    <Tabs defaultValue="tab-1" >
      <TabsList className="mb-3 gap-1 bg-background w-full rounded-xl justify-start p-2">
        <TabsTrigger
          value="tab-1"
          className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
        >
          <Send
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Sent
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
        >
          <HeartHandshake
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Recieve
        </TabsTrigger>

      </TabsList>

      <TabsContent value="tab-1" className="">
        <div className="bg-background w-full rounded-xl ">
          <h6 className="w-full text-sm font-medium pb-2 px-4 py-4">Manage My Network</h6>
          <Separator className="mb-2"></Separator>
          <ScrollArea className="max-h-[60vh] overflow-auto scrollbar-none px-4">
            <ProfileSent />
          </ScrollArea>
        </div>
      </TabsContent>
      <TabsContent value="tab-2">

        <div className="bg-background w-full rounded-xl ">
          <h6 className="w-full text-sm font-medium pb-2 px-4 py-4">Manage My Network</h6>
          <Separator className="mb-2"></Separator>
          <ScrollArea className="max-h-[60vh] scrollbar-none px-4">
            <ProfileRecieve />
          </ScrollArea>
        </div>

      </TabsContent>

    </Tabs>
  )
}
