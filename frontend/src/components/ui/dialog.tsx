"use client";
import { Dialog as Primitive } from "radix-ui";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export function DialogContent({
  className,
  children,
  hideClose = false,
  ...props
}: ComponentProps<typeof Primitive.Content> & { hideClose?: boolean }) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]" />
      <Primitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl outline-none",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <Primitive.Close
            aria-label="ปิดหน้าต่าง"
            className="absolute top-5 right-5 rounded-md p-1 text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <X className="size-5" />
          </Primitive.Close>
        )}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      className={cn("pr-7 text-xl font-semibold text-slate-900", className)}
      {...props}
    />
  );
}
export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      className={cn("mt-2 text-sm leading-6 text-slate-500", className)}
      {...props}
    />
  );
}
