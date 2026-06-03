"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { noticesApi } from "@/lib/api/notices";
import { NoticeCategory, NoticeCreatePayload } from "@/types/admin";

interface NoticeFormClientProps {
  mode: "create" | "edit";
  noticeId?: number;
}

const categorySelectOptions: { value: NoticeCategory; label: string }[] = [
  { value: "SERVICE", label: "서비스" },
  { value: "UPDATE", label: "업데이트" },
  { value: "EVENT", label: "이벤트" },
  { value: "NOTICE", label: "공지" },
];

const emptyForm = (): NoticeCreatePayload => ({
  title: "",
  content: "",
  category: "NOTICE",
  isActive: true,
  isPinned: false,
});

export default function NoticeFormClient({
  mode,
  noticeId,
}: NoticeFormClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<NoticeCreatePayload>(emptyForm());
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !noticeId) return;
    setLoading(true);
    noticesApi
      .getNotice(noticeId)
      .then((notice) => {
        setForm({
          title: notice.title,
          content: notice.content,
          category: notice.category,
          isActive: notice.isActive,
          isPinned: notice.isPinned,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mode, noticeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 본문을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "edit" && noticeId) {
        await noticesApi.updateNotice(noticeId, form);
      } else {
        await noticesApi.createNotice(form);
      }
      router.push("/notices");
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
          onClick={() => router.push("/notices")}
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
          {mode === "create" ? "공지 등록" : "공지 편집"}
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
            placeholder="공지 제목을 입력하세요"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            카테고리
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category: e.target.value as NoticeCategory,
              }))
            }
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          >
            {categorySelectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            본문
          </label>
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            required
            rows={12}
            placeholder="공지 본문을 입력하세요"
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
          <label className="flex items-center gap-2 text-sm text-black dark:text-white">
            <input
              type="checkbox"
              checked={!!form.isPinned}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPinned: e.target.checked }))
              }
              className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
            />
            상단 고정
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/notices")}
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
