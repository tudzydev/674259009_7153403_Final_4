"use client";
import { Select as Primitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const Select = Primitive.Root;
export const SelectValue = Primitive.Value;
export function SelectTrigger({
  children,
  className,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 aria-invalid:border-red-500",
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Icon>
        <ChevronDown className="size-4 text-slate-400" />
      </Primitive.Icon>
    </Primitive.Trigger>
  );
}
export function SelectContent({
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        position="popper"
        sideOffset={5}
        className="z-[60] max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        {...props}
      >
        <Primitive.Viewport>{children}</Primitive.Viewport>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function SelectItem({
  children,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className="relative cursor-pointer rounded-md py-2 pr-8 pl-3 text-sm outline-none data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
      {...props}
    >
      <Primitive.ItemText>{children}</Primitive.ItemText>
      <Primitive.ItemIndicator className="absolute right-2">
        <Check className="size-4" />
      </Primitive.ItemIndicator>
    </Primitive.Item>
  );
}
