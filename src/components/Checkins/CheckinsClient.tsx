"use client";
import React, { useEffect, useRef, useState } from "react";
import { checkinsApi } from "@/lib/api/checkins";
import { Checkin, CrowdLevel, PageResponse } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import CheckinDeleteModal from "@/components/Checkins/CheckinDeleteModal";

const crowdLevelStyle: Record<CrowdLevel, string> = {
  QUIET: "bg-meta-3/10 text-meta-3",
  NORMAL: "bg-meta-6/10 text-meta-6",
  CROWDED: "bg-meta-1/10 text-meta-1",
};

const crowdLevelLabel: Record<CrowdLevel, string> = {
  QUIET: "한산",
  NORMAL: "보통",
  CROWDED: "혼잡",
};

/**
 * 체크인/혼잡도 모더레이션 화면.
 * - articleId / crowdLevel / hasMessage 필터 + 페이지네이션.
 * - 삭제(물리) 액션은 OPERATOR↑ 노출(VIEWER 숨김).
 */
export default function CheckinsClient() {
  const { admin } = useAuth();
  const canModerate = admin?.role === "OPERATOR" || admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<Checkin> | null>(null);
  const [page, setPage] = useState(0);
  const [articleId, setArticleId] = useState("");
  const [crowdLevel, setCrowdLevel] = useState<"" | CrowdLevel>("");
  const [hasMessage, setHasMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Checkin | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const load = (
    p: number,
    aid: string,
    cl: "" | CrowdLevel,
    onlyMsg: boolean,
  ) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    const parsedAid = aid.trim() ? Number(aid) : undefined;
    checkinsApi
      .list({
        page: p,
        size: 20,
        articleId: Number.isInteger(parsedAid) ? parsedAid : undefined,
        crowdLevel: cl || undefined,
        hasMessage: onlyMsg ? true : undefined,
      })
      .then((res) => {
        if (reqId === reqIdRef.current) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (reqId === reqIdRef.current)
          setError(e instanceof Error ? e.message : "체크인 목록을 불러올 수 없습니다.");
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    load(page, articleId, crowdLevel, hasMessage);
  }, [page, crowdLevel, hasMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleArticleIdChange = (val: string) => {
    setArticleId(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, crowdLevel, hasMessage);
    }, 300);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">체크인 모더레이션</h1>
        <p className="mt-1 text-sm text-gray-500">
          스팟 체크인과 혼잡도·방명록 메시지를 검수합니다. 부적절 시 삭제(물리)할 수 있습니다.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="number"
          value={articleId}
          onChange={(e) => handleArticleIdChange(e.target.value)}
          placeholder="글 ID"
          className="w-28 rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <select
          value={crowdLevel}
          onChange={(e) => {
            setCrowdLevel(e.target.value as "" | CrowdLevel);
            setPage(0);
          }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">혼잡도 전체</option>
          <option value="QUIET">한산 (QUIET)</option>
          <option value="NORMAL">보통 (NORMAL)</option>
          <option value="CROWDED">혼잡 (CROWDED)</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasMessage}
            onChange={(e) => {
              setHasMessage(e.target.checked);
              setPage(0);
            }}
            className="h-4 w-4"
          />
          <span>방명록 메시지 있는 것만</span>
        </label>
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
                <th className="px-4 py-3 text-left font-medium">혼잡도</th>
                <th className="px-4 py-3 text-left font-medium">방명록</th>
                <th className="px-4 py-3 text-left font-medium">좌표</th>
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
                    체크인이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((c) => (
                  <tr
                    key={c.checkinId}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">{c.checkinId}</td>
                    <td className="px-4 py-3 text-gray-500">#{c.articleId}</td>
                    <td className="px-4 py-3 text-gray-500">#{c.userId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${crowdLevelStyle[c.crowdLevel]}`}
                      >
                        {crowdLevelLabel[c.crowdLevel]} ({c.crowdLevel})
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {c.message ? (
                        <span className="line-clamp-2 text-gray-700 dark:text-gray-300">
                          {c.message}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.createdAt?.slice(0, 10)}</td>
                    {canModerate && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                        >
                          삭제
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

      {deleteTarget && (
        <CheckinDeleteModal
          checkin={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => load(page, articleId, crowdLevel, hasMessage)}
        />
      )}
    </div>
  );
}
