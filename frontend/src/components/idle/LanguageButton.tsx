"use client"

import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { languageOptions } from "@/lib/LanguageOptions"
import { useIdle } from "@/hooks/useIdle"



export default function LanguageButton() {
  const {setLanguage} =useIdle()
  const [selectedIndex, setSelectedIndex] = useState("1")

  return (
    <div className="inline-flex divide-x divide-primary-foreground/30 rounded-md shadow-xs rtl:space-x-reverse">
      <Button className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10">
        {languageOptions[Number(selectedIndex)].name}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            size="icon"
            aria-label="Options"
       
          >
            <ChevronDownIcon size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="max-w-64 md:max-w-xs ml-10"
          side="bottom"
          sideOffset={4}
          align="end"
        >
          <DropdownMenuRadioGroup
            value={selectedIndex}
            onValueChange={setSelectedIndex}
          >
            {languageOptions.map((option, index) => (
              <DropdownMenuRadioItem
              onClick={()=>{
                setLanguage(option.id)
              }}
                key={option.id}
                value={String(index)}
                className="items-start  [&>span]:pt-1.5"
              >
                <div className="flex gap-3 w-full justify-between items-center">
                  <span className="text-sm font-medium">{option.name}</span>
                  <span className="text-sm ">
                    {option.version}
                  </span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
