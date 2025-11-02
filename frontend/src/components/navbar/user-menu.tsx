import {
  BoltIcon,
 
  Layers2Icon,
  LogOutIcon,
  // PinIcon,
  UserPenIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useNetwork } from "@/hooks/useNetwork"
import { useState } from "react"

export default function UserMenu() {
  const { setTabValue } = useNetwork()
  const { username, email, name } = useAuth()
  
  // Split the name by space
  const [change, setChange] = useState(true)
  const splitName = name?.split(" ");

  // Get the first character of each part and capitalize it
  const initials = splitName?.map((part: string) => part.charAt(0).toUpperCase()).join("");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent dark:hover:bg-transparent">
          <Avatar>
            <AvatarImage src="/origin/avatar.jpg" alt="Profile image" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {username}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link to={"/setting"}>
          <DropdownMenuItem>
            <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Settings</span>
          </DropdownMenuItem>
          </Link>
          <Link to={"/network"} onClick={() => {
              setTabValue("tab-2")
              setChange(!change)

            }

            }>

            <DropdownMenuItem >
              <Layers2Icon size={16} className="opacity-60" aria-hidden="true" />
              <span>My Network</span>
            </DropdownMenuItem>
          </Link>
       
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem>
            <PinIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Option 4</span>
          </DropdownMenuItem> */}
          <DropdownMenuItem>
            <UserPenIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>View Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link to={"/logout"}>
          <DropdownMenuItem>
            <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
