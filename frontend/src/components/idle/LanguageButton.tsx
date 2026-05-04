
import { useMemo } from "react"
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
  const {
    language,
    setLanguage,
    setLanguageId,
    setPostAllow,
    setStdout,
    setStderr,
    setExecuteTime,
  } = useIdle()

  const selectedIndex = useMemo(() => {
    const idx = languageOptions.findIndex((option) => option.id === language)
    return String(idx >= 0 ? idx : 0)
  }, [language])

  return (
    <div className="inline-flex divide-x divide-primary-foreground/30 rounded-md shadow-xs rtl:space-x-reverse">
      <Button className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10">
        {languageOptions[Number(selectedIndex)]?.name || "Language"}
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
          className="max-w-64 md:max-w-xs max-h-[400px] z-[600] ml-10 overflow-auto scrollbar-none"
          side="bottom"
          sideOffset={4}
          align="end"
        >
          <DropdownMenuRadioGroup
            value={selectedIndex}
            onValueChange={(value) => {
              const option = languageOptions[Number(value)]
              if (!option) return
              setLanguage(option.id)
              setLanguageId(option.judge0)
              // Language change means old output is stale for the new compiler runtime.
              setPostAllow(false)
              setStdout("")
              setStderr("")
              setExecuteTime("0")
            }}
          >
            {languageOptions.map((option, index) => (
              <DropdownMenuRadioItem
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
