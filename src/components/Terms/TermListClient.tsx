"use client";
import React, { useEffect, useState } from "react";
import { termsApi } from "@/lib/api/terms";
import { PageResponse, Term, TermType } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import TermFormModal from "./TermFormModal";
import TermDeleteModal from "./TermDeleteModal";

const typeBadgeClass: Record<TermType, string> = {
  SERVICE: "bg-primary/10 text-primary",
  PRIVACY: "bg-meta-3/10 text-meta-3",
  LOCATION: "bg-meta-5/10 text-meta-5",
  MARKETING: "bg-meta-6/10 text-meta-6",
};

const typeOptions: { value: string; label: string }[] = [
  { value: "", label: "전체 종류" },
  { value: "SERVICE", label: "이용약관" },
  { value: "PRIVACY", label: "개인정보처리방침" },
  { value: "LOCATION", label: "위치기반서비스" },
  { value: "MARKETING", label: "마케팅 수신 동의" },
];

const activeOptions: { value: string; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "true", label: "활성" },
  { value: "false", label: "비활성" },
];

export default function TermListClient() {
  const { admin } = useAuth();
  const canEdit = admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<Term> | null>(null);
  const [page, setPage] = useState(0);
  const [type, setType] = useState("");
  const [active, setActive] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Term | null>(null);

  const load = (p: number, t: string, act: string, kw: string) => {
    setLoading(true);
    setError("");
    termsApi
      .getTerms({
        page: p,
        size: 20,
        type: t || undefined,
        isActive: act === "" ? undefined : act === "true",
        keyword: kw || undefined,
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, type, active, keyword);
  }, [page, type, active, keyword]);

  const reload = () => load(page, type, active, keyword);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setKeyword(keywordInput.trim());
  };

  const replaceRow = (updated: Term) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((n) =>
              n.termId === updated.termId ? updated : n,
            ),
          }
        : prev,
    );
  };

  const handleToggleActive = async (id: number) => {
    if (!canEdit) return;
    try {
      const updated = await termsApi.toggleActive(id);
      replaceRow(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "활성 변경 실패");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">약관 관리</h1>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedTerm(null);
              setFormMode("create");
            }}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            + 약관 등록
          </button>
        )}
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-4 flex flex-wrap items-center gap-3"
      >
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(0);
          }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          {typeOptions.map((opt) => (
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
                <th className="px-4 py-3 text-left font-medium">종류</th>
                <th className="px-4 py-3 text-left font-medium">버전</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">발효일</th>
                <th className="px-4 py-3 text-left font-medium">발효중</th>
                <th className="px-4 py-3 text-left font-medium">활성</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    등록된 약관이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((term) => (
                  <tr
                    key={term.termId}
                    className="border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">{term.termId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          typeBadgeClass[term.type] ?? "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {term.typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{term.version}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">
                        {term.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {term.effectiveAt?.replace("T", " ").slice(0, 16)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          term.isCurrentlyEffective
                            ? "bg-meta-3/10 text-meta-3"
                            : "bg-gray-200 text-gray-500 dark:bg-meta-4 dark:text-gray-400"
                        }`}
                      >
                        {term.isCurrentlyEffective ? "발효중" : "미발효"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(term.termId)}
                        disabled={!canEdit}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          term.isActive
                            ? "bg-meta-3/10 text-meta-3 hover:bg-meta-3/20"
                            : "bg-meta-1/10 text-meta-1 hover:bg-meta-1/20"
                        } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {term.isActive ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {canEdit ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTerm(term);
                                setFormMode("edit");
                              }}
                              className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                            >
                              편집
                            </button>
                            <button
                              onClick={() => setDeleteTarget(term)}
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
        <TermFormModal
          mode={formMode}
          term={selectedTerm}
          onClose={() => {
            setFormMode(null);
            setSelectedTerm(null);
          }}
          onSuccess={reload}
        />
      )}

      {deleteTarget && (
        <TermDeleteModal
          term={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={reload}
        />
      )}
    </div>
  );
}
