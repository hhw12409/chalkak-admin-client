"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api/events";
import { EventCreatePayload, EventStatus } from "@/types/admin";

interface EventFormClientProps {
  mode: "create" | "edit";
  eventId?: number;
}

const statusSelectOptions: { value: EventStatus; label: string }[] = [
  { value: "UPCOMING", label: "예정" },
  { value: "ONGOING", label: "진행중" },
  { value: "ENDED", label: "종료" },
];

const emptyForm = (): EventCreatePayload => ({
  title: "",
  description: "",
  bannerImageUrl: "",
  eventStatus: "UPCOMING",
  startDate: "",
  endDate: "",
  participantCount: 0,
  prizes: "",
  rules: "",
  cautions: "",
  isActive: true,
});

export default function EventFormClient({
  mode,
  eventId,
}: EventFormClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<EventCreatePayload>(emptyForm());
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !eventId) return;
    setLoading(true);
    eventsApi
      .getEvent(eventId)
      .then((event) => {
        setForm({
          title: event.title,
          description: event.description ?? "",
          bannerImageUrl: event.bannerImageUrl ?? "",
          eventStatus: event.eventStatus,
          startDate: event.startDate,
          endDate: event.endDate,
          participantCount: event.participantCount,
          prizes: event.prizes ?? "",
          rules: event.rules ?? "",
          cautions: event.cautions ?? "",
          isActive: event.isActive,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mode, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      alert("시작일과 종료일을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "edit" && eventId) {
        await eventsApi.updateEvent(eventId, form);
      } else {
        await eventsApi.createEvent(form);
      }
      router.push("/events");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white py-10 text-center text-gray-400 shadow-default dark:border-strokedark dark:bg-boxdark">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="mb-4 text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          {mode === "create" ? "이벤트 등록" : "이벤트 편집"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-sm border border-stroke bg-white p-6.5 shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            제목
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
            required
            maxLength={200}
            placeholder="이벤트 제목을 입력하세요"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              이벤트 상태
            </label>
            <select
              value={form.eventStatus}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  eventStatus: e.target.value as EventStatus,
                }))
              }
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            >
              {statusSelectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              시작일
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              종료일
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            설명
          </label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            placeholder="이벤트 설명을 입력하세요"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              배너 이미지 URL
            </label>
            <input
              type="text"
              value={form.bannerImageUrl ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, bannerImageUrl: e.target.value }))
              }
              placeholder="https://..."
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              참여자 수
            </label>
            <input
              type="number"
              min={0}
              value={form.participantCount ?? 0}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  participantCount: Number(e.target.value) || 0,
                }))
              }
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            상품 안내
          </label>
          <textarea
            value={form.prizes ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, prizes: e.target.value }))
            }
            rows={5}
            placeholder="줄바꿈으로 구분"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            참여 규칙
          </label>
          <textarea
            value={form.rules ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, rules: e.target.value }))
            }
            rows={5}
            placeholder="줄바꿈으로 구분"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            유의사항
          </label>
          <textarea
            value={form.cautions ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, cautions: e.target.value }))
            }
            rows={4}
            placeholder="줄바꿈으로 구분"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-black dark:text-white">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
            />
            활성
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
