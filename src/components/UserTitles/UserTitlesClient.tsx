"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { userTitlesApi } from "@/lib/api/userTitles";
import { UserTitle } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import UserTitleFormModal from "@/components/UserTitles/UserTitleFormModal";
import UserTitleDeleteModal from "@/components/UserTitles/UserTitleDeleteModal";

/**
 * 직책 마스터 관리 화면.
 * - 활성 토글 필터 + 라벨 검색
 * - ADMIN 만 등록/수정/삭제 버튼 활성. OPERATOR/VIEWER 에게는 비노출.
 * - 페이지네이션 없음 (마스터 수십 개 이하 전제).
 */
export default function UserTitlesClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [items, setItems] = useState<UserTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [formModal, setFormModal] = useState<
    | { mode: "create" }
    | { mode: "edit"; title: UserTitle }
    | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<UserTitle | null>(null);

  const load = () => {
    setLoading(true);
    userTitlesApi
      .list(activeOnly ? { activeOnly: true } : undefined)
      .then((rows) => {
        setItems(rows);
        setError("");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "직책 목록을 불러올 수 없습니다.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return items;
    return items.filter((t) => t.label.toLowerCase().includes(kw));
  }, [items, keyword]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">직책 마스터 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            사용자에게 부여할 직책을 관리합니다. 비활성 직책은 사용자 상세 드롭다운에서 선택할 수 없습니다.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setFormModal({ mode: "create" })}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            + 새 직책 등록
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="h-4 w-4"
          />
          <span>활성만 표시</span>
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="라벨 검색"
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            {items.length === 0
              ? "등록된 직책이 없습니다"
              : "검색 결과가 없습니다"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white">라벨</th>
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white">순서</th>
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white">활성</th>
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white">상태</th>
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white">생성일</th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left font-medium text-black dark:text-white">액션</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">
                      <span className="inline-block rounded bg-meta-1/10 px-2 py-0.5 text-xs text-meta-1">
                        {t.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.displayOrder}</td>
                    <td className="px-4 py-3">
                      {t.isActive ? (
                        <span className="rounded bg-meta-3/10 px-2 py-0.5 text-xs font-medium text-meta-3">
                          활성
                        </span>
                      ) : (
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-meta-4 dark:text-gray-300">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          t.status === "ACTIVE"
                            ? "bg-meta-3/10 text-meta-3"
                            : "bg-meta-5/10 text-meta-5"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.createdAt?.slice(0, 10)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setFormModal({ mode: "edit", title: t })}
                            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isAdmin && (
        <p className="mt-3 text-xs text-gray-500">
          직책 마스터의 등록/수정/삭제는 ADMIN 권한만 가능합니다.{" "}
          <Link href="/users" className="text-primary hover:underline">
            사용자에게 직책을 부여하려면 사용자 관리에서 진행해주세요.
          </Link>
        </p>
      )}

      {formModal && (
        <UserTitleFormModal
          mode={formModal.mode}
          title={formModal.mode === "edit" ? formModal.title : null}
          onClose={() => setFormModal(null)}
          onSuccess={() => load()}
        />
      )}

      {deleteTarget && (
        <UserTitleDeleteModal
          title={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => load()}
        />
      )}
    </div>
  );
}
