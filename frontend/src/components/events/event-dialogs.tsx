"use client";
import {
  CalendarDays,
  CircleCheck,
  FileClock,
  Loader2,
  Trash2,
} from "lucide-react";
import type { Event, EventInput } from "@/types/event";
import { formatEventDate } from "@/lib/event-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { EventForm } from "./event-form";
export function StatusBadge({ status }: { status: boolean }) {
  return (
    <Badge
      className={
        status
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }
    >
      {status ? (
        <CircleCheck className="size-3.5" />
      ) : (
        <FileClock className="size-3.5" />
      )}
      {status ? "เผยแพร่" : "ฉบับร่าง"}
    </Badge>
  );
}
export function CategoryBadge({ category }: { category: Event["category"] }) {
  return (
    <Badge
      className={
        category === "อบรม"
          ? "bg-indigo-50 text-indigo-700"
          : category === "สัมมนา"
            ? "bg-amber-50 text-amber-700"
            : "bg-teal-50 text-teal-700"
      }
    >
      {category}
    </Badge>
  );
}
export function EventFormDialog({
  event,
  pending,
  onClose,
  onSubmit,
}: {
  event?: Event;
  pending: boolean;
  onClose: () => void;
  onSubmit: (data: EventInput) => Promise<void>;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent
        hideClose={pending}
        onEscapeKeyDown={(e) => {
          if (pending) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        <DialogTitle>{event ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</DialogTitle>
        <DialogDescription>
          กรอกข้อมูลกิจกรรมให้ครบถ้วน ช่องที่มี * เป็นข้อมูลที่จำเป็น
        </DialogDescription>
        <EventForm
          event={event}
          pending={pending}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
export function EventDetailDialog({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const values = [
    ["รหัสกิจกรรม", `#${String(event.id).padStart(3, "0")}`],
    ["ชื่อกิจกรรม", event.title],
    ["ผู้จัด", event.organizer],
    ["หมวดหมู่", <CategoryBadge key="category" category={event.category} />],
    [
      "วันที่จัด",
      <span key="date" className="flex items-center gap-2">
        <CalendarDays className="size-4 text-slate-400" />
        {formatEventDate(event.eventDate)}
      </span>,
    ],
    ["สถานะ", <StatusBadge key="status" status={event.status} />],
    ["รายละเอียด", event.description],
    ...(event.createdAt
      ? [
          [
            "สร้างเมื่อ",
            formatEventDate(event.createdAt, "th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          ],
        ]
      : []),
    ...(event.updatedAt
      ? [
          [
            "แก้ไขล่าสุด",
            formatEventDate(event.updatedAt, "th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          ],
        ]
      : []),
  ];
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>รายละเอียดกิจกรรม</DialogTitle>
        <DialogDescription>ข้อมูลกิจกรรมและสถานะการเผยแพร่</DialogDescription>
        <dl className="mt-6 divide-y divide-slate-100">
          {values.map(([label, value]) => (
            <div
              key={String(label)}
              className="grid gap-2 py-3 sm:grid-cols-[120px_1fr]"
            >
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="min-w-0 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <DialogClose asChild>
            <Button variant="outline">ปิด</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function DeleteEventDialog({
  event,
  pending,
  onClose,
  onDelete,
}: {
  event: Event;
  pending: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <AlertDialogContent>
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Trash2 className="size-5" />
        </div>
        <AlertDialogTitle className="text-lg font-semibold">
          ยืนยันการลบกิจกรรม
        </AlertDialogTitle>
        <AlertDialogDescription className="mt-3 break-words text-sm leading-7 text-slate-500">
          คุณต้องการลบกิจกรรม &apos;{event.title}&apos; ใช่หรือไม่?
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </AlertDialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={pending}>
              ยกเลิก
            </Button>
          </AlertDialogCancel>
          <Button variant="destructive" disabled={pending} onClick={onDelete}>
            {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {pending ? "กำลังลบ..." : "ลบกิจกรรม"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
