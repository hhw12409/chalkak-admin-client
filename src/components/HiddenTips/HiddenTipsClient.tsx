"use client";
import React, { useEffect, useRef, useState } from "react";
import { hiddenTipsApi } from "@/lib/api/hiddenTips";
import { HiddenTip, PageResponse } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import HiddenTipEditModal from "@/components/HiddenTips/HiddenTipEditModal";
import HiddenTipDeleteModal from "@/components/HiddenTips/HiddenTipDeleteModal";

/**
 * 히든팁 모더레이션 화면.
 * - articleId / keyword 필터 + 페이지네이션.
 * - 수정/삭제(soft) 액션은 OPERATOR↑ 노출(VIEWER 숨김).
 */
export default function HiddenTipsClient() {
  const { admin } = useAuth();
  const canModerate = admin?.role === "OPERATOR" || admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<HiddenTip> | null>(null);
  const [page, setPage] = useState(0);
  const [articleId, setArticleId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState<HiddenTip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HiddenTip | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const load = (p: number, aid: string, kw: string) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    const parsedAid = aid.trim() ? Number(aid) : undefined;
    hiddenTipsApi
      .list({
        page: p,
        size: 20,
        articleId: Number.isInteger(parsedAid) ? parsedAid : undefined,
        keyword: kw || undefined,
      })
      .then((res) => {
        if (reqId === reqIdRef.current) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (reqId === reqIdRef.current)
          setError(e instanceof Error ? e.message : "히든팁 목록을 불러올 수 없습니다.");
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    load(page, articleId, keyword);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, setter === setArticleId ? val : articleId, setter === setKeyword ? val : keyword);
    }, 300);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">히든팁 모더레이션</h1>
        <p className="mt-1 text-sm text-gray-500">
          스팟 히든팁을 검수합니다. 내용 정정(수정) 또는 부적절 시 소프트 삭제할 수 있습니다.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="number"
          value={articleId}
          onChange={(e) => handleFilterChange(setArticleId, e.target.value)}
          placeholder="글 ID"
          className="w-28 rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <input
          type="text"
          value={keyword}
          onChange={(e) => handleFilterChange(setKeyword, e.target.value)}
          placeholder="제목·내용 검색"
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">글ID</th>
                <th className="px-4 py-3 text-left font-medium">작성자</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">내용</th>
                <th className="px-4 py-3 text-left font-medium">스팟라벨</th>
                <th className="px-4 py-3 text-left font-medium">생성일</th>
                {canModerate && <th className="px-4 py-3 text-left font-medium">액션</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canModerate ? 8 : 7} className="px-4 py-8 text-center text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={canModerate ? 8 : 7} className="px-4 py-8 text-center text-gray-400">
                    히든팁이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((t) => (
                  <tr
                    key={t.tipId}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">{t.tipId}</td>
                    <td className="px-4 py-3 text-gray-500">#{t.articleId}</td>
                    <td className="px-4 py-3 text-gray-500">#{t.userId}</td>
                    <td className="px-4 py-3 max-w-[12rem]">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">
                        {t.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-2 text-gray-500">{t.content}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.spotLabel ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{t.createdAt?.slice(0, 10)}</td>
                    {canModerate && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditTarget(t)}
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
          />
        )}
      </div>

      {editTarget && (
        <HiddenTipEditModal
          tip={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => load(page, articleId, keyword)}
        />
      )}

      {deleteTarget && (
        <HiddenTipDeleteModal
          tip={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => load(page, articleId, keyword)}
        />
      )}
    </div>
  );
}
