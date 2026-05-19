"use client"
import { useState } from "react"
import { Controller, Control, FieldValues, Path } from "react-hook-form"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import { Button } from "./button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { ScrollArea } from "./scroll-area"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { Input } from "./input"
import { cn } from "../lib/utils"
import React from "react"

interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  disabled?: boolean
  placeholder?: string
  defaultCountry?: RPNInput.Country
  international?: boolean
}

const PhoneField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  placeholder = "Enter phone number",
  defaultCountry,
  international = true,
}: PhoneFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-1" data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel className={cn(disabled && "pointer-events-none")} htmlFor={name}>
              {label}
            </FieldLabel>
          )}
          <RPNInput.default
            className="flex"
            flagComponent={FlagComponent}
            countrySelectComponent={(props) => <CountrySelect {...props} disabled={disabled} />}
            inputComponent={InputComponent}
            smartCaret={false}
            value={field.value || undefined}
            onChange={(value) => field.onChange(value || "")}
            disabled={disabled}
            placeholder={placeholder}
            international={international}
            defaultCountry={defaultCountry}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => (
  <Input className={cn("rounded-s-none rounded-e-lg", className)} {...props} ref={ref} />
))
InputComponent.displayName = "InputComponent"

type CountryEntry = {
  label: string
  value: RPNInput.Country | undefined
}

interface CountrySelectProps {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

const CountrySelect = ({ disabled, value: selectedCountry, options: countryList, onChange }: CountrySelectProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) setSearchValue("")
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="flex gap-1 rounded-s-lg rounded-e-none border-r-0 px-3 focus:z-10" disabled={disabled}>
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown className={cn("-mr-2 size-4 opacity-50", disabled && "hidden")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-75 p-0" align="start">
        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value)
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
                  if (viewportElement) {
                    viewportElement.scrollTop = 0
                  }
                }
              }, 0)
            }}
            placeholder="Search country..."
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      onSelectComplete={() => setOpen(false)}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country
  onChange: (country: RPNInput.Country) => void
  onSelectComplete: () => void
}

const CountrySelectOption = ({ country, countryName, selectedCountry, onChange, onSelectComplete }: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country)
    onSelectComplete()
  }

  return (
    <CommandItem className="gap-2" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>

      <CommandShortcut className="flex items-center gap-2">
        <span className="text-xs text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
        <CheckIcon className={cn("size-3", country === selectedCountry ? "opacity-100" : "opacity-0")} />
      </CommandShortcut>
    </CommandItem>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">{Flag && <Flag title={countryName} />}</span>
}

export default PhoneField
