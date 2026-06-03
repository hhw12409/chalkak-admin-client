"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { noticesApi } from "@/lib/api/notices";
import { Notice, NoticeCategory, PageResponse } from "@/types/admin";
import Pagination from "@/components/common/Pagination";

const categoryBadgeClass: Record<NoticeCategory, string> = {
  SERVICE: "bg-primary/10 text-primary",
  UPDATE: "bg-meta-3/10 text-meta-3",
  EVENT: "bg-meta-5/10 text-meta-5",
  NOTICE: "bg-meta-6/10 text-meta-6",
};

const categoryOptions: { value: string; label: string }[] = [
  { value: "", label: "전체 카테고리" },
  { value: "SERVICE", label: "서비스" },
  { value: "UPDATE", label: "업데이트" },
  { value: "EVENT", label: "이벤트" },
  { value: "NOTICE", label: "공지" },
];

const activeOptions: { value: string; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "true", label: "활성" },
  { value: "false", label: "비활성" },
];

export default function NoticeListClient() {
  const router = useRouter();
  const [data, setData] = useState<PageResponse<Notice> | null>(null);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState("");
  const [active, setActive] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (
    p: number,
    cat: string,
    act: string,
    kw: string,
  ) => {
    setLoading(true);
    setError("");
    noticesApi
      .getNotices({
        page: p,
        size: 20,
        category: cat || undefined,
        isActive: act === "" ? undefined : act === "true",
        keyword: kw || undefined,
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, category, active, keyword);
  }, [page, category, active, keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setKeyword(keywordInput.trim());
  };

  const replaceRow = (updated: Notice) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((n) =>
              n.noticeId === updated.noticeId ? updated : n,
            ),
          }
        : prev,
    );
  };

  const handleTogglePin = async (id: number) => {
    try {
      const updated = await noticesApi.togglePin(id);
      replaceRow(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "고정 변경 실패");
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const updated = await noticesApi.toggleActive(id);
      replaceRow(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "활성 변경 실패");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
    try {
      await noticesApi.deleteNotice(id);
      load(page, category, active, keyword);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          공지사항 관리
        </h1>
        <button
          onClick={() => router.push("/notices/new")}
          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
        >
          + 공지 등록
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-4 flex flex-wrap items-center gap-3"
      >
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            setPage(0);
          }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          {activeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="제목 검색"
          className="flex-1 min-w-[200px] rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
        >
          검색
        </button>
      </form>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">고정</th>
                <th className="px-4 py-3 text-left font-medium">활성</th>
                <th className="px-4 py-3 text-left font-medium">등록일</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    불러오는 중...
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    등록된 공지사항이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((notice) => (
                  <tr
                    key={notice.noticeId}
                    className="border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {notice.noticeId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          categoryBadgeClass[notice.category] ??
                          "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {notice.categoryLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">
                        {notice.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePin(notice.noticeId)}
                        title={notice.isPinned ? "고정 해제" : "고정"}
                        className={`rounded px-2 py-1 text-xs ${
                          notice.isPinned
                            ? "bg-primary text-white hover:bg-opacity-90"
                            : "border border-stroke bg-white text-gray-500 hover:bg-gray-1 dark:border-strokedark dark:bg-boxdark dark:text-gray-400 dark:hover:bg-meta-4"
                        }`}
                      >
                        📌 {notice.isPinned ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(notice.noticeId)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          notice.isActive
                            ? "bg-meta-3/10 text-meta-3 hover:bg-meta-3/20"
                            : "bg-meta-1/10 text-meta-1 hover:bg-meta-1/20"
                        }`}
                      >
                        {notice.isActive ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {notice.createdAt?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            router.push(`/notices/${notice.noticeId}/edit`)
                          }
                          className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleDelete(notice.noticeId)}
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
