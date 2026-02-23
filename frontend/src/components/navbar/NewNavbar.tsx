import { useId } from "react"
import {

  HouseIcon,
  MailIcon,
  SearchIcon,
  UsersRound,
} from "lucide-react"

import Logo from "@/components/navbar/logo"
import NotificationMenu from "@/components/navbar/notification-menu"
import UserMenu from "@/components/navbar/user-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuItem,

  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useNetwork } from "@/hooks/useNetwork"
import useChat from "@/hooks/useChat"



// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/network", label: "Network", icon: UsersRound },
]

export default function NewNavbar() {
  const id = useId()
  const { setTabValue } = useNetwork()
  const location = useLocation()
  const { setOpenChat } = useChat()

  return (
    <header className=" px-4 md:px-6 sticky top-0 bg-background z-409">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1 md:hidden">
              <NavigationMenu className="max-w-none .\*\:w-full {
    :is(& > *) {
        width: 100%;
    }
}">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2 ">
                  {navigationLinks.map((link, index) => {
                    const Icon = link.icon
                    return (
                      <NavigationMenuItem key={index} className="w-full">
                        <Link
                          to={link.href}
                          className="flex-row flex items-center gap-2 py-1.5"
                          onClick={() => setTabValue("tab-1")}
                        >
                          <Icon
                            size={16}
                            className="text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span>{link.label}</span>
                        </Link>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          <div className="flex flex-1 items-center justify-between gap-6">
            <Link to="/" className="text-primary hover:text-primary/90">
              <Logo />
            </Link>
            {/* Search form */}
            <div className="relative ">
              <Input
                id={id}
                className="peer h-8 ps-8 pe-2"
                placeholder="Search..."
                type="search"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
                <SearchIcon size={16} />
              </div>
            </div>
          </div>
        </div>
        {/* Middle area */}
        <NavigationMenu className="max-md:hidden flex flex-1">
          <NavigationMenuList className="gap-2">
            {navigationLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;

              return (
                <NavigationMenuItem key={index}>
                  <Link
                    key={link.href}
                    to={link.href}
                    title={link.label}
                    onClick={() => setTabValue("tab-1")}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "relative size-8 rounded-full shadow-none",
                        isActive
                          ? "text-foreground bg-secondary"
                          : "text-muted-foreground"
                      )}
                      aria-label={link.label}
                    >
                      <Icon aria-hidden="true" />
                      <span className="sr-only">{link.label}</span>
                    </Button>
                  </Link>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>
        {/* Right side */}
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            {/* Messages */}
            <Button
              size="icon"
              variant="ghost"
              className="relative size-8 rounded-full text-muted-foreground shadow-none"
              aria-label="Open notifications"
              onClick={() => setOpenChat(true)}
            >
              <MailIcon size={16} aria-hidden="true" />
              <div
                aria-hidden="true"
                className="absolute top-0.5 right-0.5 size-1 rounded-full bg-primary"
              />
            </Button>
            {/* Notification menu */}
            <NotificationMenu />
          </div>
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
