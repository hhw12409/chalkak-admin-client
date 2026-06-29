"use client";
import React, { useEffect, useRef, useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizExcludedArticle, PageResponse } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import GeoQuizExcludedCreateModal from "@/components/GeoQuiz/GeoQuizExcludedCreateModal";

/**
 * 포토 어디게 출제 사진 관리(블록리스트) 화면.
 * - 제외된 게시글 목록(글ID/사유/등록자/등록일) + 등록/해제.
 * - 등록·해제는 ADMIN 만 노출(OPERATOR/VIEWER 읽기 전용).
 */
export default function GeoQuizExcludedArticleClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<GeoQuizExcludedArticle> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const reqIdRef = useRef(0);

  const load = (p: number) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    geoQuizApi
      .listExcluded({ page: p, size: 20 })
      .then((res) => {
        if (reqId === reqIdRef.current) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (reqId === reqIdRef.current)
          setError(e instanceof Error ? e.message : "출제 제외 목록을 불러올 수 없습니다.");
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    load(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = async (item: GeoQuizExcludedArticle) => {
    if (!isAdmin) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(`글 #${item.articleId} 을(를) 출제 제외 목록에서 해제할까요?`)
    )
      return;
    setRemovingId(item.excludedId);
    try {
      await geoQuizApi.removeExcluded(item.excludedId);
      load(page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "해제에 실패했습니다.";
      if (message.includes("찾을 수 없습니다")) {
        load(page);
      } else {
        setError(message);
      }
    } finally {
      setRemovingId(null);
    }
  };

  const colSpan = isAdmin ? 5 : 4;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            포토 어디게 출제 관리
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            출제 후보풀에서 제외할 게시글을 관리합니다. 좌표가 부정확하거나 부적절한 사진을
            블록리스트에 등록하세요.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            + 출제 제외 등록
          </button>
        )}
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">글 ID</th>
                <th className="px-4 py-3 text-left font-medium">사유</th>
                <th className="px-4 py-3 text-left font-medium">등록자</th>
                <th className="px-4 py-3 text-left font-medium">등록일</th>
                {isAdmin && <th className="px-4 py-3 text-left font-medium">액션</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">
                    제외된 게시글이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((item) => (
                  <tr
                    key={item.excludedId}
                    className="border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 font-medium text-black dark:text-white">
                      #{item.articleId}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      {item.reason ? (
                        <span className="line-clamp-2 text-gray-700 dark:text-gray-300">
                          {item.reason}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.createdBy != null ? `#${item.createdBy}` : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {item.createdAt?.replace("T", " ").slice(0, 16)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={removingId === item.excludedId}
                          className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-60"
                        >
                          {removingId === item.excludedId ? "해제 중..." : "해제"}
                        </button>
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

      {showCreate && (
        <GeoQuizExcludedCreateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setPage(0);
            load(0);
          }}
        />
      )}
    </div>
  );
}
