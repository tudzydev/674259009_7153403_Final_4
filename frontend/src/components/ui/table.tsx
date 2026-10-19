import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full caption-bottom text-left text-sm", className)}
        {...props}
      />
    </div>
  );
}
export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-12 whitespace-nowrap px-5 text-xs font-medium text-slate-500",
        className,
      )}
      {...props}
    />
  );
}
export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-5 py-4 align-middle", className)} {...props} />;
}
