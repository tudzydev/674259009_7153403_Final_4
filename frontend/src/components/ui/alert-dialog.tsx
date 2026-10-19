"use client";
import { AlertDialog as Primitive } from "radix-ui";
export const AlertDialog = Primitive.Root;
export const AlertDialogCancel = Primitive.Cancel;
export const AlertDialogAction = Primitive.Action;
export function AlertDialogContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]" />
      <Primitive.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl outline-none">
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export const AlertDialogTitle = Primitive.Title;
export const AlertDialogDescription = Primitive.Description;
