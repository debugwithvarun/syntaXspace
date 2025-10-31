
import React, { useId, useState } from "react"
import { ChevronDownIcon, PhoneIcon } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PhoneNo() {
  const id = useId()
  const [value, setValue] = useState("")

  return (
    <div  dir="ltr" className="flex flex-col gap-2">
      <Label htmlFor={id}>Phone number </Label>
      <RPNInput.default
        className="flex rounded-md shadow-xs"
        international
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={PhoneInput}
        id={id}
        placeholder="Enter phone number"
        value={value}
        onChange={(newValue) => setValue(newValue ?? "")}
      />
 
    </div>
  )
}

const PhoneInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  return (
    <Input
      data-slot="phone-input"
      className={cn(
        "-ms-px rounded-s-none shadow-none focus-visible:z-10",
        className
      )}
      {...props}
    />
  )
}

PhoneInput.displayName = "PhoneInput"

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  onChange: (value: RPNInput.Country) => void
  options: { label: string; value: RPNInput.Country | undefined }[]
}

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country)
  }

  return (
    <div
  className="
  
    relative inline-flex items-center self-stretch rounded-s-md border border-input
    bg-background py-2 ps-3 pe-2 text-muted-foreground 
    transition-colors transition-shadow outline-none
    focus-within:z-10 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50
    hover:bg-accent hover:text-foreground
    disabled:pointer-events-none disabled:opacity-50
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
  "
>
  <div className="inline-flex items-center gap-1" aria-hidden="true">
    <FlagComponent country={value} countryName={value} aria-hidden="true" />
    <span className="text-muted-foreground/80">
      <ChevronDownIcon size={16} aria-hidden="true" />
    </span>
  </div>

  <select
    disabled={disabled}
    value={value}
    onChange={handleSelect}
    aria-label="Select country"
    className="
    absolute inset-0 w-full h-full text-sm
    bg-background opacity-0 cursor-pointer
    border-0 outline-none ring-0 focus:outline-none focus:ring-0
    scrollbar-none
    "
  >
    <option key="default" value="">
      Select a country
    </option>
    {options
      .filter((x) => x.value)
      .map((option, i) => (
        <option key={option.value ?? `empty-${i}`} value={option.value}>
          {option.label} {option.value && `+${RPNInput.getCountryCallingCode(option.value)}`}
        </option>
      ))}
  </select>
</div>

  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <PhoneIcon size={16} aria-hidden="true" />
      )}
    </span>
  )
}
