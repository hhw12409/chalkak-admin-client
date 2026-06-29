"use client";
import React, { useEffect, useRef, useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizFeaturedArticle, PageResponse } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import GeoQuizFeaturedCreateModal from "@/components/GeoQuiz/GeoQuizFeaturedCreateModal";

/**
 * 포토 어디게 출제 지정(큐레이션 화이트리스트) 화면.
 * - 지정된 게시글 목록(글ID/사유/등록자/등록일) + 등록/해제.
 * - 적격 지정 글이 1개라도 있으면 출제 풀이 이 목록으로 한정됨(자동 풀 무시, 블록 우선).
 * - 등록·해제는 ADMIN 만 노출(OPERATOR/VIEWER 읽기 전용).
 */
export default function GeoQuizFeaturedArticleClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<GeoQuizFeaturedArticle> | null>(null);
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
      .listFeatured({ page: p, size: 20 })
      .then((res) => {
        if (reqId === reqIdRef.current) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (reqId === reqIdRef.current)
          setError(e instanceof Error ? e.message : "출제 지정 목록을 불러올 수 없습니다.");
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    load(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = async (item: GeoQuizFeaturedArticle) => {
    if (!isAdmin) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(`글 #${item.articleId} 을(를) 출제 지정 목록에서 해제할까요?`)
    )
      return;
    setRemovingId(item.featuredId);
    try {
      await geoQuizApi.removeFeatured(item.featuredId);
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
  const hasFeatured = (data?.totalElements ?? 0) > 0;

  return (
    <div>
      {/* 큐레이션 모드 활성 안내 배너 (필수 노출) */}
      <div
        className={`mb-5 rounded-sm border-l-4 px-4 py-3 text-sm ${
          hasFeatured
            ? "border-meta-3 bg-meta-3/10 text-meta-3"
            : "border-stroke bg-gray-2 text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300"
        }`}
      >
        <p className="font-semibold">
          {hasFeatured
            ? "🎯 큐레이션 모드 활성 — 출제가 아래 지정 목록 안에서만 진행됩니다."
            : "현재 지정 글 없음 → 자동 풀로 동작 중입니다."}
        </p>
        <p className="mt-1 leading-relaxed">
          출제 지정 목록에 <span className="font-semibold">적격한 글이 1개라도 있으면</span>,
          데일리·무한 모드 출제가 <span className="font-semibold">이 목록 안에서만</span>{" "}
          진행됩니다(자동 풀 무시). 목록이 비어 있거나 지정 글이 모두 삭제·숨김·좌표없음이면 자동
          풀로 동작합니다. <span className="font-semibold">출제 제외(블록)된 글은 지정해도 출제되지
          않습니다(블록 우선).</span>
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-gray-500">
          출제 풀을 특정 게시글로 한정(큐레이션)합니다. 시즌 명소·이벤트 사진 등을 지정하세요.
        </p>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            + 출제 지정 등록 (일괄)
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
                    지정된 게시글이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((item) => (
                  <tr
                    key={item.featuredId}
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
                          disabled={removingId === item.featuredId}
                          className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-60"
                        >
                          {removingId === item.featuredId ? "해제 중..." : "해제"}
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
        <GeoQuizFeaturedCreateModal
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
