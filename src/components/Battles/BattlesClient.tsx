"use client";
import React, { useEffect, useRef, useState } from "react";
import { battlesApi } from "@/lib/api/battles";
import { PageResponse, PhotoBattleListItem, PhotoBattleStatus } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import BattleCreateModal from "@/components/Battles/BattleCreateModal";
import BattleDetailModal from "@/components/Battles/BattleDetailModal";

/**
 * 사진 배틀 관리 화면.
 * - status 필터(전체/OPEN/CLOSED) + 페이지네이션.
 * - 생성/마감/연장 OPERATOR↑, 삭제 ADMIN. 행 [상세] → DetailModal.
 */
export default function BattlesClient() {
  const { admin } = useAuth();
  const isOperatorOrAbove = admin?.role === "OPERATOR" || admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<PhotoBattleListItem> | null>(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"" | PhotoBattleStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const reqIdRef = useRef(0);

  const load = (p: number, status: "" | PhotoBattleStatus) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    battlesApi
      .list({ page: p, size: 20, status: status || undefined })
      .then((res) => {
        if (reqId === reqIdRef.current) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (reqId === reqIdRef.current)
          setError(e instanceof Error ? e.message : "배틀 목록을 불러올 수 없습니다.");
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    load(page, statusFilter);
  }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">사진 배틀 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            스팟별 사진 배틀을 생성·마감·연장합니다. 부정 배틀은 삭제(ADMIN)할 수 있습니다.
          </p>
        </div>
        {isOperatorOrAbove && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            + 새 배틀 생성
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "" | PhotoBattleStatus);
            setPage(0);
          }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">전체 상태</option>
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">스팟 키</th>
                <th className="px-4 py-3 text-left font-medium">후보 글</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">마감 예정</th>
                <th className="px-4 py-3 text-left font-medium">총 투표</th>
                <th className="px-4 py-3 text-left font-medium">생성일</th>
                <th className="px-4 py-3 text-left font-medium">상세</th>
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
                    배틀이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((b) => (
                  <tr
                    key={b.battleId}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4 cursor-pointer"
                    onClick={() => setDetailId(b.battleId)}
                  >
                    <td className="px-4 py-3 text-gray-500">{b.battleId}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">
                      {b.spotKey}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      #{b.articleAId} vs #{b.articleBId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          b.status === "OPEN"
                            ? "bg-meta-3/10 text-meta-3"
                            : "bg-meta-5/10 text-meta-5"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {b.endAt?.slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{b.totalVotes}</td>
                    <td className="px-4 py-3 text-gray-500">{b.createdAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailId(b.battleId);
                        }}
                        className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-meta-4 dark:hover:bg-strokedark"
                      >
                        상세
                      </button>
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
          />
        )}
      </div>

      {showCreate && (
        <BattleCreateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => load(page, statusFilter)}
        />
      )}

      {detailId !== null && (
        <BattleDetailModal
          battleId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => load(page, statusFilter)}
        />
      )}
    </div>
  );
}
