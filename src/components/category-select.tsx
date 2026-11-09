"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

/** Category dropdown used by both the add and edit travel-package forms. */
export function CategorySelect({
  value,
  onValueChange,
  invalid,
}: {
  value: string | null;
  onValueChange: (value: string | null) => void;
  invalid?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className="h-10 w-full"
        aria-invalid={invalid || undefined}
      >
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
