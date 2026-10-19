"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileClock,
  GraduationCap,
  LayoutDashboard,
  ListFilter,
  Loader2,
  Menu,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { eventApi, apiErrorMessage } from "@/lib/api";
import { formatEventDate } from "@/lib/event-utils";
import {
  EVENT_CATEGORIES,
  type Event,
  type EventCategory,
  type EventInput,
} from "@/types/event";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import {
  CategoryBadge,
  StatusBadge,
  EventDetailDialog,
  EventFormDialog,
  DeleteEventDialog,
} from "./event-dialogs";

type ActiveDialog =
  | { kind: "create" }
  | { kind: "edit" | "detail" | "delete"; event: Event }
  | null;
type Stats = { total: number; published: number; drafts: number };

function Navigation({
  overview,
  onNavigate,
}: {
  overview: boolean;
  onNavigate: (overview: boolean) => void;
}) {
  return (
    <>
      <div className="px-3">
        <Image
          src="/logo.png"
          alt="Event Management ระบบจัดการกิจกรรม"
          width={1254}
          height={1254}
          sizes="240px"
          className="h-auto w-full"
        />
      </div>
      <p className="mt-12 mb-3 px-4 text-[10px] font-semibold tracking-[.15em] text-slate-400">
        เมนูหลัก
      </p>
      <nav aria-label="เมนูหลัก" className="space-y-1.5">
        {[
          { label: "Dashboard", icon: LayoutDashboard, value: true },
          { label: "จัดการกิจกรรม", icon: CalendarDays, value: false },
        ].map(({ label, icon: Icon, value }) => (
          <button
            key={label}
            onClick={() => onNavigate(value)}
            aria-current={overview === value ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500",
              overview === value
                ? "bg-indigo-50 font-semibold text-indigo-600"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
            {overview === value && (
              <span className="ml-auto size-1.5 rounded-full bg-indigo-500" />
            )}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
        <GraduationCap className="mb-3 size-5 text-slate-400" />
        <p className="text-xs font-medium text-slate-600">
          พื้นที่สำหรับทุกกิจกรรม
        </p>
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          จัดการการเรียนรู้และประสบการณ์
          <br />
          ของชุมชนมหาวิทยาลัยในที่เดียว
        </p>
      </div>
    </>
  );
}

export function EventDashboard() {
  const [overview, setOverview] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [pending, setPending] = useState(false);
  const operationLock = useRef(false);
  const activeFilters = !!search.trim() || category !== "all";
  const reset = () => {
    setSearch("");
    setCategory("all");
  };
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(
      async () => {
        setLoading(true);
        setError(false);
        try {
          const data = await eventApi.getAll(
            {
              search: search.trim(),
              category: category === "all" ? undefined : category,
            },
            controller.signal,
          );
          if (!controller.signal.aborted) setEvents(data);
        } catch {
          if (!controller.signal.aborted) setError(true);
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      search.trim() ? 300 : 0,
    );
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, revision]);

  useEffect(() => {
    const controller = new AbortController();
    eventApi
      .getAll({}, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setStats({
            total: data.length,
            published: data.filter((event) => event.status).length,
            drafts: data.filter((event) => !event.status).length,
          });
          setStatsError(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStats(null);
          setStatsError(true);
        }
      });
    return () => controller.abort();
  }, [revision]);

  async function save(data: EventInput) {
    if (
      operationLock.current ||
      !dialog ||
      (dialog.kind !== "edit" && dialog.kind !== "create")
    )
      return;
    operationLock.current = true;
    setPending(true);
    try {
      if (dialog.kind === "edit") await eventApi.update(dialog.event.id, data);
      else await eventApi.create(data);
      toast.success(
        dialog.kind === "edit"
          ? "บันทึกการแก้ไขกิจกรรมเรียบร้อยแล้ว"
          : "เพิ่มกิจกรรมเรียบร้อยแล้ว",
      );
      setDialog(null);
      refresh();
    } catch (error) {
      toast.error(
        apiErrorMessage(error, "ไม่สามารถบันทึกกิจกรรมได้ กรุณาลองอีกครั้ง"),
      );
    } finally {
      operationLock.current = false;
      setPending(false);
    }
  }
  async function remove() {
    if (operationLock.current || dialog?.kind !== "delete") return;
    operationLock.current = true;
    setPending(true);
    try {
      await eventApi.delete(dialog.event.id);
      toast.success("ลบกิจกรรมเรียบร้อยแล้ว");
      setDialog(null);
      refresh();
    } catch (error) {
      toast.error(
        apiErrorMessage(error, "ไม่สามารถลบกิจกรรมได้ กรุณาลองอีกครั้ง"),
      );
    } finally {
      operationLock.current = false;
      setPending(false);
    }
  }
  const navigate = (value: boolean) => {
    setOverview(value);
    setMobileOpen(false);
  };
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Toaster position="top-right" richColors closeButton />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-4 py-8 lg:flex">
        <Navigation overview={overview} onNavigate={navigate} />
      </aside>
      <div className="min-w-0 lg:pl-64">
        <header className="flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="เปิดเมนู"
                >
                  <Menu />
                </Button>
              </DialogTrigger>
              <DialogContent className="top-0 left-0 flex h-dvh max-h-dvh w-[min(85vw,290px)] translate-x-0 translate-y-0 flex-col rounded-none p-5">
                <DialogTitle className="sr-only">เมนูหลัก</DialogTitle>
                <DialogDescription className="sr-only">
                  เลือกหน้าที่ต้องการใช้งาน
                </DialogDescription>
                <Navigation overview={overview} onNavigate={navigate} />
              </DialogContent>
            </Dialog>
            <span className="text-sm text-slate-400">พื้นที่ทำงาน</span>
            <ChevronRight className="size-3.5 text-slate-300" />
            <span className="text-sm font-medium">
              {overview ? "Dashboard" : "จัดการกิจกรรม"}
            </span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="size-1.5 rounded-full bg-indigo-400" />
            ระบบจัดการกิจกรรม
          </div>
        </header>
        <main className="mx-auto max-w-[1536px] space-y-7 p-5 sm:p-8 lg:p-10">
          <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-[.16em] text-indigo-500">
                UNIVERSITY ACTIVITIES
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
                {overview ? "ภาพรวมกิจกรรม" : "จัดการกิจกรรม"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                บริหารจัดการข้อมูลกิจกรรม อบรม สัมมนา และจิตอาสา
              </p>
            </div>
            <Button
              onClick={() => setDialog({ kind: "create" })}
              disabled={pending}
              className="w-full sm:w-auto"
            >
              <Plus />
              เพิ่มกิจกรรม
            </Button>
          </section>
          <section
            aria-label="สถิติกิจกรรมทั้งหมด"
            className="grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                label: "กิจกรรมทั้งหมด",
                value: stats?.total,
                icon: CalendarDays,
                color: "bg-indigo-50 text-indigo-600",
                note: "กิจกรรมในระบบทั้งหมด",
              },
              {
                label: "เผยแพร่แล้ว",
                value: stats?.published,
                icon: CheckCircle2,
                color: "bg-emerald-50 text-emerald-600",
                note: "กิจกรรมที่พร้อมเผยแพร่",
              },
              {
                label: "ฉบับร่าง",
                value: stats?.drafts,
                icon: FileClock,
                color: "bg-amber-50 text-amber-600",
                note: "กิจกรรมที่รอการเผยแพร่",
              },
            ].map(({ label, value, icon: Icon, color, note }) => (
              <article
                key={label}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{label}</p>
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg",
                      color,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="mt-2 text-[32px] font-semibold tabular-nums tracking-tight">
                  {value === undefined ? (
                    <span
                      aria-label={
                        statsError ? "โหลดสถิติไม่สำเร็จ" : "กำลังโหลดสถิติ"
                      }
                    >
                      {statsError ? (
                        "—"
                      ) : (
                        <span className="my-3 block h-8 w-16 animate-pulse rounded bg-slate-100" />
                      )}
                    </span>
                  ) : (
                    value.toLocaleString("th-TH")
                  )}
                </p>
                <p className="mt-2 text-xs text-slate-400">{note}</p>
              </article>
            ))}
          </section>
          {statsError && (
            <p
              role="status"
              className="flex items-center gap-2 text-xs text-amber-700"
            >
              <CircleAlert className="size-4" />
              ไม่สามารถโหลดสถิติได้
              <Button variant="ghost" size="sm" onClick={refresh}>
                ลองอีกครั้ง
              </Button>
            </p>
          )}
          {overview ? (
            <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <GraduationCap className="size-6" />
                </div>
                <h2 className="text-lg font-semibold">
                  ทุกกิจกรรม เริ่มต้นจากที่นี่
                </h2>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                ติดตามภาพรวมการเผยแพร่กิจกรรมของมหาวิทยาลัย
                และจัดการข้อมูลกิจกรรม อบรม สัมมนา และจิตอาสาได้ในที่เดียว
              </p>
              <Button className="mt-6" onClick={() => navigate(false)}>
                ไปหน้าจัดการกิจกรรม
                <ArrowRight />
              </Button>
            </section>
          ) : (
            <section
              className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs"
              aria-label="รายการกิจกรรม"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">รายการกิจกรรม</h2>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs tabular-nums text-slate-500">
                    {loading || error ? "—" : `${events.length} รายการ`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="รีเฟรชรายการ"
                  disabled={loading || pending}
                  onClick={refresh}
                >
                  <RefreshCw className={loading ? "animate-spin" : ""} />
                </Button>
              </div>
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400" />
                  <Input
                    aria-label="ค้นหาชื่อกิจกรรม"
                    className="pr-10 pl-10"
                    placeholder="ค้นหาชื่อกิจกรรม..."
                    value={search}
                    disabled={pending}
                    onChange={(e) => {
                      setLoading(true);
                      setSearch(e.target.value);
                    }}
                  />
                  {search && (
                    <button
                      aria-label="ล้างคำค้นหา"
                      className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
                      onClick={() => {
                        setLoading(true);
                        setSearch("");
                      }}
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                <div className="w-full sm:w-48">
                  <Select
                    value={category}
                    disabled={pending}
                    onValueChange={(value) => {
                      setLoading(true);
                      setCategory(value as EventCategory | "all");
                    }}
                  >
                    <SelectTrigger aria-label="กรองหมวดหมู่">
                      <span className="flex items-center gap-2">
                        <ListFilter className="size-4 text-slate-400" />
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                      {EVENT_CATEGORIES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {activeFilters && (
                  <Button variant="ghost" disabled={pending} onClick={reset}>
                    ล้างตัวกรอง
                  </Button>
                )}
              </div>
              {error ? (
                <div
                  role="alert"
                  className="flex flex-col items-center px-5 py-20 text-center"
                >
                  <div className="mb-5 rounded-full bg-red-50 p-4 text-red-500">
                    <CircleAlert className="size-7" />
                  </div>
                  <h3 className="font-semibold">
                    ไม่สามารถโหลดข้อมูลกิจกรรมได้ กรุณาลองอีกครั้ง
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    ตรวจสอบการเชื่อมต่อกับเซิร์ฟเวอร์ แล้วลองโหลดข้อมูลใหม่
                  </p>
                  <Button className="mt-6" variant="outline" onClick={refresh}>
                    <RefreshCw />
                    ลองอีกครั้ง
                  </Button>
                </div>
              ) : (
                <Table>
                  <caption className="sr-only">
                    ข้อมูลกิจกรรมของมหาวิทยาลัย
                  </caption>
                  <thead className="border-b border-slate-100 bg-slate-50/80">
                    <tr>
                      {[
                        "รหัส",
                        "ชื่อกิจกรรม",
                        "ผู้จัด",
                        "หมวดหมู่",
                        "วันที่จัด",
                        "สถานะ",
                        "จัดการ",
                      ].map((label) => (
                        <TableHead
                          key={label}
                          className={label === "จัดการ" ? "text-right" : ""}
                        >
                          {label}
                        </TableHead>
                      ))}
                    </tr>
                  </thead>
                  <tbody aria-busy={loading}>
                    {loading ? (
                      Array.from({ length: 5 }, (_, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-100 last:border-0"
                        >
                          {Array.from({ length: 7 }, (_, j) => (
                            <TableCell key={j}>
                              <div
                                className={cn(
                                  "h-4 animate-pulse rounded bg-slate-100",
                                  j === 1 ? "w-48" : "w-16",
                                )}
                              />
                            </TableCell>
                          ))}
                        </tr>
                      ))
                    ) : events.length === 0 ? (
                      <tr>
                        <TableCell colSpan={7}>
                          <div className="flex flex-col items-center py-16 text-center">
                            <div className="mb-5 rounded-full bg-slate-50 p-5 text-slate-400">
                              {activeFilters ? (
                                <SearchX className="size-8" />
                              ) : (
                                <CalendarDays className="size-8" />
                              )}
                            </div>
                            <h3 className="font-semibold">
                              {activeFilters
                                ? "ไม่พบกิจกรรมที่ตรงกับเงื่อนไขการค้นหา"
                                : "ยังไม่มีข้อมูลกิจกรรม"}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              {activeFilters
                                ? "ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น"
                                : "เริ่มต้นสร้างกิจกรรมแรกของมหาวิทยาลัยได้เลย"}
                            </p>
                            <Button
                              className="mt-6"
                              variant={activeFilters ? "outline" : "default"}
                              onClick={() =>
                                activeFilters
                                  ? reset()
                                  : setDialog({ kind: "create" })
                              }
                            >
                              {activeFilters ? (
                                "ล้างตัวกรอง"
                              ) : (
                                <>
                                  <Plus />
                                  เพิ่มกิจกรรม
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr
                          key={event.id}
                          className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                        >
                          <TableCell className="text-xs tabular-nums text-slate-400">
                            #{String(event.id).padStart(3, "0")}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() =>
                                setDialog({ kind: "detail", event })
                              }
                              className="block max-w-72 truncate text-left font-medium text-slate-800 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500"
                              title={event.title}
                            >
                              {event.title}
                            </button>
                          </TableCell>
                          <TableCell>
                            <span
                              className="block max-w-40 truncate text-slate-500"
                              title={event.organizer}
                            >
                              {event.organizer}
                            </span>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={event.category} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-slate-500">
                            {formatEventDate(event.eventDate)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={event.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-0.5">
                              {[
                                {
                                  kind: "detail",
                                  label: "ดูรายละเอียด",
                                  icon: Eye,
                                },
                                { kind: "edit", label: "แก้ไข", icon: Pencil },
                                { kind: "delete", label: "ลบ", icon: Trash2 },
                              ].map(({ kind, label, icon: Icon }) => (
                                <Button
                                  key={kind}
                                  variant="ghost"
                                  size="icon"
                                  disabled={pending}
                                  aria-label={`${label}: ${event.title}`}
                                  title={label}
                                  className={
                                    kind === "delete"
                                      ? "hover:bg-red-50 hover:text-red-600"
                                      : "hover:bg-indigo-50 hover:text-indigo-600"
                                  }
                                  onClick={() =>
                                    setDialog({
                                      kind: kind as
                                        "detail" | "edit" | "delete",
                                      event,
                                    })
                                  }
                                >
                                  <Icon />
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:px-6">
                <span role="status">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-3 animate-spin" />
                      กำลังโหลดกิจกรรม...
                    </span>
                  ) : error ? (
                    "โหลดข้อมูลไม่สำเร็จ"
                  ) : (
                    `แสดง ${events.length.toLocaleString("th-TH")} รายการ${activeFilters ? "ตามเงื่อนไขการค้นหา" : "ทั้งหมด"}`
                  )}
                </span>
                <span className="hidden sm:inline">เวลาประเทศไทย (GMT+7)</span>
              </div>
            </section>
          )}
          <footer className="flex flex-col justify-between gap-2 pb-2 text-[11px] text-slate-400 sm:flex-row">
            <span>Event Management · ระบบจัดการกิจกรรมมหาวิทยาลัย</span>
            <span>สร้างการเรียนรู้ เชื่อมต่อทุกโอกาส</span>
          </footer>
        </main>
      </div>
      {dialog?.kind === "detail" && (
        <EventDetailDialog
          event={dialog.event}
          onClose={() => setDialog(null)}
        />
      )}
      {(dialog?.kind === "create" || dialog?.kind === "edit") && (
        <EventFormDialog
          event={dialog.kind === "edit" ? dialog.event : undefined}
          pending={pending}
          onClose={() => {
            if (!pending) setDialog(null);
          }}
          onSubmit={save}
        />
      )}
      {dialog?.kind === "delete" && (
        <DeleteEventDialog
          event={dialog.event}
          pending={pending}
          onClose={() => setDialog(null)}
          onDelete={remove}
        />
      )}
    </div>
  );
}
