"use client";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { EVENT_CATEGORIES, type Event, type EventInput } from "@/types/event";
import {
  validateEvent,
  type EventValidationErrors,
} from "@/lib/event-validation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type FormValues = Omit<EventInput, "category"> & { category: string };
function ErrorText({
  field,
  errors,
}: {
  field: keyof EventInput;
  errors: EventValidationErrors;
}) {
  return errors[field] ? (
    <p
      id={`${field}-error`}
      role="alert"
      className="mt-1.5 text-xs text-red-600"
    >
      {errors[field]}
    </p>
  ) : null;
}

export function EventForm({
  event,
  pending,
  onCancel,
  onSubmit,
}: {
  event?: Event;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (data: EventInput) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>(() =>
    event
      ? {
          title: event.title,
          organizer: event.organizer,
          category: event.category,
          eventDate: event.eventDate,
          description: event.description,
          status: event.status,
        }
      : {
          title: "",
          organizer: "",
          category: "",
          eventDate: "",
          description: "",
          status: true,
        },
  );
  const [errors, setErrors] = useState<EventValidationErrors>({});
  const update = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const attrs = (field: keyof EventInput) => ({
    id: field,
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });
  return (
    <form
      ref={formRef}
      noValidate
      className="mt-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        const result = validateEvent(values);
        if (!result.success) {
          setErrors(result.errors);
          const field = Object.keys(result.errors)[0];
          formRef.current
            ?.querySelector<HTMLElement>(`[id="${field}"]`)
            ?.focus();
          return;
        }
        await onSubmit(result.data);
      }}
    >
      <fieldset disabled={pending} className="space-y-5">
        <div>
          <Label htmlFor="title">
            ชื่อกิจกรรม <span className="text-red-500">*</span>
          </Label>
          <Input
            {...attrs("title")}
            className="mt-2"
            placeholder="เช่น อบรมพัฒนาเว็บไซต์ด้วย React"
            maxLength={150}
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
          />
          <ErrorText errors={errors} field="title" />
        </div>
        <div>
          <Label htmlFor="organizer">
            ผู้จัดกิจกรรม <span className="text-red-500">*</span>
          </Label>
          <Input
            {...attrs("organizer")}
            className="mt-2"
            placeholder="ระบุหน่วยงานหรือผู้จัดกิจกรรม"
            maxLength={100}
            value={values.organizer}
            onChange={(e) => update("organizer", e.target.value)}
          />
          <ErrorText errors={errors} field="organizer" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">
              หมวดหมู่ <span className="text-red-500">*</span>
            </Label>
            <Select
              value={values.category}
              onValueChange={(value) => update("category", value)}
              disabled={pending}
            >
              <SelectTrigger {...attrs("category")} className="mt-2">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorText errors={errors} field="category" />
          </div>
          <div>
            <Label htmlFor="eventDate">
              วันที่จัดกิจกรรม <span className="text-red-500">*</span>
            </Label>
            <Input
              {...attrs("eventDate")}
              className="mt-2"
              type="date"
              min="0001-01-01"
              max="9999-12-31"
              value={values.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
            />
            <ErrorText errors={errors} field="eventDate" />
          </div>
        </div>
        <div>
          <Label htmlFor="description">
            รายละเอียดกิจกรรม <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...attrs("description")}
            className="mt-2"
            placeholder="อธิบายวัตถุประสงค์และรายละเอียดของกิจกรรม..."
            maxLength={2000}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <div className="mt-1.5 flex justify-between gap-2">
            <ErrorText errors={errors} field="description" />
            <span className="ml-auto text-xs tabular-nums text-slate-400">
              {values.description.length.toLocaleString("th-TH")} / 2,000
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <Label htmlFor="status">เผยแพร่กิจกรรม</Label>
            <p className="mt-1 text-xs text-slate-500">
              {values.status
                ? "กิจกรรมนี้จะแสดงเป็นสถานะเผยแพร่"
                : "บันทึกกิจกรรมนี้เป็นฉบับร่าง"}
            </p>
          </div>
          <input
            {...attrs("status")}
            type="checkbox"
            role="switch"
            checked={values.status}
            onChange={(e) => update("status", e.target.checked)}
            className="h-5 w-5 shrink-0 cursor-pointer accent-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500"
          />
          <ErrorText errors={errors} field="status" />
        </div>
      </fieldset>
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          ยกเลิก
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {pending
            ? "กำลังบันทึก..."
            : event
              ? "บันทึกการแก้ไข"
              : "บันทึกกิจกรรม"}
        </Button>
      </div>
    </form>
  );
}
