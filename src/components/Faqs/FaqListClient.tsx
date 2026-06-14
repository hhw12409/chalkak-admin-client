"use client";
import React, { useEffect, useState } from "react";
import { faqsApi } from "@/lib/api/faqs";
import { Faq, FaqCategory, PageResponse } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import FaqFormModal from "./FaqFormModal";
import FaqDeleteModal from "./FaqDeleteModal";

const categoryBadgeClass: Record<FaqCategory, string> = {
  GENERAL: "bg-primary/10 text-primary",
  ACCOUNT: "bg-meta-3/10 text-meta-3",
  POINT: "bg-meta-5/10 text-meta-5",
  SPOT: "bg-meta-6/10 text-meta-6",
  COMMUNITY: "bg-meta-7/10 text-meta-7",
};

const categoryOptions: { value: string; label: string }[] = [
  { value: "", label: "전체 카테고리" },
  { value: "GENERAL", label: "일반" },
  { value: "ACCOUNT", label: "계정" },
  { value: "POINT", label: "포인트" },
  { value: "SPOT", label: "포토스팟" },
  { value: "COMMUNITY", label: "커뮤니티" },
];

const activeOptions: { value: string; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "true", label: "활성" },
  { value: "false", label: "비활성" },
];

export default function FaqListClient() {
  const { admin } = useAuth();
  const canEdit = admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<Faq> | null>(null);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState("");
  const [active, setActive] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const load = (p: number, cat: string, act: string, kw: string) => {
    setLoading(true);
    setError("");
    faqsApi
      .getFaqs({
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

  const reload = () => load(page, category, active, keyword);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setKeyword(keywordInput.trim());
  };

  const replaceRow = (updated: Faq) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((n) =>
              n.faqId === updated.faqId ? updated : n,
            ),
          }
        : prev,
    );
  };

  const handleToggleActive = async (id: number) => {
    if (!canEdit) return;
    try {
      const updated = await faqsApi.toggleActive(id);
      replaceRow(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "활성 변경 실패");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">FAQ 관리</h1>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedFaq(null);
              setFormMode("create");
            }}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            + FAQ 등록
          </button>
        )}
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
          placeholder="질문 검색"
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
                <th className="px-4 py-3 text-left font-medium">질문</th>
                <th className="px-4 py-3 text-left font-medium">순서</th>
                <th className="px-4 py-3 text-left font-medium">활성</th>
                <th className="px-4 py-3 text-left font-medium">등록일</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    등록된 FAQ가 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((faq) => (
                  <tr
                    key={faq.faqId}
                    className="border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">{faq.faqId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          categoryBadgeClass[faq.category] ??
                          "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {faq.categoryLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">
                        {faq.question}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{faq.displayOrder}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(faq.faqId)}
                        disabled={!canEdit}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          faq.isActive
                            ? "bg-meta-3/10 text-meta-3 hover:bg-meta-3/20"
                            : "bg-meta-1/10 text-meta-1 hover:bg-meta-1/20"
                        } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {faq.isActive ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {faq.createdAt?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {canEdit ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedFaq(faq);
                                setFormMode("edit");
                              }}
                              className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                            >
                              편집
                            </button>
                            <button
                              onClick={() => setDeleteTarget(faq)}
                              className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                            >
                              삭제
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">권한 없음</span>
                        )}
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

      {formMode && (
        <FaqFormModal
          mode={formMode}
          faq={selectedFaq}
          onClose={() => {
            setFormMode(null);
            setSelectedFaq(null);
          }}
          onSuccess={reload}
        />
      )}

      {deleteTarget && (
        <FaqDeleteModal
          faq={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={reload}
        />
      )}
    </div>
  );
}
