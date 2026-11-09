"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, Globe } from "lucide-react";
import { cn } from "cn";

/**
 * Full country list (alphabetical). Filter/search and hover/keyboard highlight
 * are handled by Base UI's Combobox (single-quote values match item labels).
 */
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts & Nevis", "Saint Lucia", "Samoa",
  "San Marino", "Sao Tome & Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad & Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

export function CountryCombobox({
  id,
  value,
  onValueChange,
  invalid,
}: {
  id?: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  invalid?: boolean;
}) {
  return (
    <ComboboxPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      items={COUNTRIES}
      autoHighlight
      name="country"
    >
      <div
        className={cn(
          "relative flex h-10 items-center rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          invalid &&
            "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50"
        )}
      >
        <Globe
          className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
          aria-hidden
        />
        <ComboboxPrimitive.Input
          id={id}
          placeholder="Start typing a country…"
          className="h-full w-full min-w-0 bg-transparent pr-1 pl-9 text-sm outline-hidden placeholder:text-muted-foreground"
          aria-invalid={invalid || undefined}
        />
        <ComboboxPrimitive.Trigger className="group absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50">
          <ChevronDownIcon className="size-4 transition-transform duration-150 group-data-[popup-open]:rotate-180" />
        </ComboboxPrimitive.Trigger>
      </div>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="isolate z-50">
          <ComboboxPrimitive.Popup className="relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-56 origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <ComboboxPrimitive.List className="p-1">
              {/* `items` is set on the Root, so List takes a function child and
                  renders only the filtered subset (fixed several times over). */}
              {(item, index) => (
                <ComboboxPrimitive.Item
                  key={String(item)}
                  value={item}
                  index={index}
                  className="relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:font-medium"
                >
                  <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-3.5" />
                  </ComboboxPrimitive.ItemIndicator>
                  {String(item)}
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
            <ComboboxPrimitive.Empty className="px-2 py-3 text-center text-sm text-muted-foreground">
              No country matches your search.
            </ComboboxPrimitive.Empty>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
