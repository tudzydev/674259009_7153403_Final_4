"use client";

import { CalendarDays, Eye, Loader2, Pencil, Plus, SearchX, Trash2 } from "lucide-react";
import type { Event } from "@/types/event";
import { formatEventDate } from "@/lib/event-utils";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { CategoryBadge, StatusBadge } from "./event-dialogs";

export type EventAction = "detail" | "edit" | "delete";

function EventActions({ event, pending, onAction, mobile = false }: {
  event: Event;
  pending: boolean;
  onAction: (kind: EventAction, event: Event) => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {([
        { kind: "detail", label: "ดูรายละเอียด", icon: Eye },
        { kind: "edit", label: "แก้ไข", icon: Pencil },
        { kind: "delete", label: "ลบ", icon: Trash2 },
      ] as const).map(({ kind, label, icon: Icon }) => (
        <Button
          key={kind}
          variant={kind === "edit" ? "outline" : "ghost"}
          size={mobile || kind === "edit" ? "sm" : "icon"}
          aria-label={`${label}: ${event.title}`}
          title={label}
          disabled={pending}
          className={kind === "delete" ? "text-slate-500 hover:bg-red-50 hover:text-red-700" : ""}
          onClick={() => onAction(kind, event)}
        >
          <Icon />
          {(mobile || kind === "edit") && label}
        </Button>
      ))}
    </div>
  );
}

export function EventList({ events, loading, pending, activeFilters, onReset, onCreate, onAction }: {
  events: Event[];
  loading: boolean;
  pending: boolean;
  activeFilters: boolean;
  onReset: () => void;
  onCreate: () => void;
  onAction: (kind: EventAction, event: Event) => void;
}) {
  if (loading) return (
    <div className="space-y-4 p-6" aria-busy="true" aria-label="กำลังโหลดกิจกรรม">
      <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" />กำลังโหลดกิจกรรม...</p>
      {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
    </div>
  );

  if (events.length === 0) return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-500">
        {activeFilters ? <SearchX className="size-8" /> : <CalendarDays className="size-8" />}
      </div>
      <h3 className="text-lg font-semibold">{activeFilters ? "ไม่พบกิจกรรมที่ค้นหา" : "สร้างกิจกรรมแรกของคุณ"}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {activeFilters ? "ลองใช้คำค้นหาอื่น หรือเปลี่ยนหมวดหมู่และสถานะที่เลือก" : "เพิ่มรายละเอียดกิจกรรม แล้วเลือกเผยแพร่หรือเก็บเป็นฉบับร่างได้เลย"}
      </p>
      <Button className="mt-5" variant={activeFilters ? "outline" : "default"} onClick={activeFilters ? onReset : onCreate}>
        {activeFilters ? "ล้างตัวกรองทั้งหมด" : <><Plus />เพิ่มกิจกรรมใหม่</>}
      </Button>
    </div>
  );

  return (
    <>
      <div className="divide-y divide-slate-100 md:hidden">
        {events.map((event) => (
          <article key={event.id} className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CategoryBadge category={event.category} />
              <StatusBadge status={event.status} />
            </div>
            <div>
              <button className="text-left text-base font-semibold leading-7 text-slate-900 hover:text-indigo-600 focus-visible:outline-indigo-500" onClick={() => onAction("detail", event)}>{event.title}</button>
              <p className="mt-1 text-sm text-slate-500">{event.organizer}</p>
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="size-4 text-slate-400" />{formatEventDate(event.eventDate)}</p>
            <div className="border-t border-slate-100 pt-3"><EventActions event={event} pending={pending} onAction={onAction} mobile /></div>
          </article>
        ))}
      </div>
      <div className="hidden md:block">
        <Table>
          <caption className="sr-only">รายการกิจกรรม วันที่จัด และสถานะการเผยแพร่</caption>
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>{["กิจกรรม / ผู้จัด", "หมวดหมู่", "วันที่จัด", "สถานะ", "จัดการ"].map((label) => <TableHead key={label} className={label === "จัดการ" ? "text-right" : ""}>{label}</TableHead>)}</tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30">
                <TableCell className="min-w-52">
                  <button className="text-left font-semibold leading-6 text-slate-800 hover:text-indigo-600 focus-visible:outline-indigo-500" onClick={() => onAction("detail", event)}>{event.title}</button>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{event.organizer}</p>
                </TableCell>
                <TableCell><CategoryBadge category={event.category} /></TableCell>
                <TableCell className="whitespace-nowrap text-slate-600">{formatEventDate(event.eventDate)}</TableCell>
                <TableCell><StatusBadge status={event.status} /></TableCell>
                <TableCell><EventActions event={event} pending={pending} onAction={onAction} /></TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
