"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api/events";
import { AdminEvent, EventStatus, PageResponse } from "@/types/admin";
import Pagination from "@/components/common/Pagination";

const statusBadgeClass: Record<EventStatus, string> = {
  UPCOMING: "bg-primary/10 text-primary",
  ONGOING: "bg-meta-3/10 text-meta-3",
  ENDED: "bg-meta-6/10 text-meta-6",
};

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "UPCOMING", label: "예정" },
  { value: "ONGOING", label: "진행중" },
  { value: "ENDED", label: "종료" },
];

export default function EventListClient() {
  const router = useRouter();
  const [data, setData] = useState<PageResponse<AdminEvent> | null>(null);
  const [page, setPage] = useState(0);
  const [eventStatus, setEventStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (p: number, status: string) => {
    setLoading(true);
    setError("");
    eventsApi
      .getEvents({
        page: p,
        size: 20,
        eventStatus: status || undefined,
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, eventStatus);
  }, [page, eventStatus]);

  const replaceRow = (updated: AdminEvent) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((e) =>
              e.eventId === updated.eventId ? updated : e,
            ),
          }
        : prev,
    );
  };

  const handleToggleActive = async (id: number) => {
    try {
      const updated = await eventsApi.toggleActive(id);
      replaceRow(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "활성 변경 실패");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("이벤트를 삭제하시겠습니까?")) return;
    try {
      await eventsApi.deleteEvent(id);
      load(page, eventStatus);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          이벤트 관리
        </h1>
        <button
          onClick={() => router.push("/events/new")}
          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
        >
          + 이벤트 등록
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={eventStatus}
          onChange={(e) => {
            setEventStatus(e.target.value);
            setPage(0);
          }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">시작일</th>
                <th className="px-4 py-3 text-left font-medium">종료일</th>
                <th className="px-4 py-3 text-left font-medium">참여자수</th>
                <th className="px-4 py-3 text-left font-medium">활성</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    불러오는 중...
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    등록된 이벤트가 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((event) => (
                  <tr
                    key={event.eventId}
                    className="border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {event.eventId}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">
                        {event.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          statusBadgeClass[event.eventStatus] ??
                          "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {event.eventStatusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {event.startDate}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {event.endDate}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {event.participantCount}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(event.eventId)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          event.isActive
                            ? "bg-meta-3/10 text-meta-3 hover:bg-meta-3/20"
                            : "bg-meta-1/10 text-meta-1 hover:bg-meta-1/20"
                        }`}
                      >
                        {event.isActive ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            router.push(`/events/${event.eventId}/edit`)
                          }
                          className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleDelete(event.eventId)}
                          className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            first={data.first}
            last={data.last}
            onPageChange={setPage}
            itemLabel="건"
          />
        )}
      </div>
    </div>
  );
}
