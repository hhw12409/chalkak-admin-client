"use client";
import React, { useRef, useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizPlay, PageResponse } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import GeoQuizPlayDetailModal from "@/components/GeoQuiz/GeoQuizPlayDetailModal";
import GeoQuizScoreModal from "@/components/GeoQuiz/GeoQuizScoreModal";
import GeoQuizPlayDeleteModal from "@/components/GeoQuiz/GeoQuizPlayDeleteModal";

/**
 * 포토 어디게 플레이 데이터 관리 화면.
 * - userId 입력 → 플레이 목록(playDate/총점/문항수) → 행 클릭 상세(문항별 guess).
 * - 점수 정정/삭제는 ADMIN 만(상세 모달 내부 버튼).
 */
export default function GeoQuizPlayClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [userIdInput, setUserIdInput] = useState("");
  const [queriedUserId, setQueriedUserId] = useState<number | null>(null);
  const [data, setData] = useState<PageResponse<GeoQuizPlay> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailId, setDetailId] = useState<number | null>(null);
  const [scoreTarget, setScoreTarget] = useState<GeoQuizPlay | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GeoQuizPlay | null>(null);
  const reqIdRef = useRef(0);

  const load = (uid: number, p: number) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    geoQuizApi
      .listPlays({ userId: uid, page: p, size: 20 })
      .then((res) => {
        if (reqId === reqIdRef.current) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (reqId === reqIdRef.current)
          setError(e instanceof Error ? e.message : "플레이 기록을 불러올 수 없습니다.");
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  };

  const handleSearch = () => {
    const uid = Number(userIdInput.trim());
    if (!userIdInput.trim() || !Number.isInteger(uid) || uid <= 0) {
      setError("조회할 유저 ID(양의 정수)를 입력하세요.");
      return;
    }
    setQueriedUserId(uid);
    setPage(0);
    load(uid, 0);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    if (queriedUserId != null) load(queriedUserId, p);
  };

  const refresh = () => {
    if (queriedUserId != null) load(queriedUserId, page);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          포토 어디게 플레이 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          유저별 데일리 플레이 기록을 조회하고, 문항별 추측을 확인하거나 점수 정정·삭제할 수
          있습니다.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="number"
          min={1}
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="유저 ID"
          className="w-40 rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <button
          onClick={handleSearch}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          조회
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      {queriedUserId == null ? (
        <div className="rounded-sm border border-stroke bg-white py-12 text-center text-sm text-gray-400 shadow-default dark:border-strokedark dark:bg-boxdark">
          유저 ID를 입력해 플레이 기록을 조회하세요.
        </div>
      ) : (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-4 py-3 text-left font-medium">플레이 ID</th>
                  <th className="px-4 py-3 text-left font-medium">날짜</th>
                  <th className="px-4 py-3 text-right font-medium">총점</th>
                  <th className="px-4 py-3 text-right font-medium">문항 수</th>
                  <th className="px-4 py-3 text-left font-medium">생성일</th>
                  <th className="px-4 py-3 text-left font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : data?.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      유저 #{queriedUserId} 의 플레이 기록이 없습니다
                    </td>
                  </tr>
                ) : (
                  data?.content.map((p) => (
                    <tr
                      key={p.playId}
                      className="border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                      <td className="px-4 py-3 font-medium text-black dark:text-white">
                        #{p.playId}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.playDate}</td>
                      <td className="px-4 py-3 text-right font-medium text-black dark:text-white">
                        {p.totalScore.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">{p.questionCount}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {p.createdAt?.replace("T", " ").slice(0, 16)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailId(p.playId)}
                          className="rounded border border-stroke px-2 py-1 text-xs hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
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
              onPageChange={handlePageChange}
              itemLabel="건"
            />
          )}
        </div>
      )}

      {detailId != null && (
        <GeoQuizPlayDetailModal
          playId={detailId}
          isAdmin={isAdmin}
          onClose={() => setDetailId(null)}
          onRequestScore={(play) => {
            setDetailId(null);
            setScoreTarget(play);
          }}
          onRequestDelete={(play) => {
            setDetailId(null);
            setDeleteTarget(play);
          }}
        />
      )}

      {scoreTarget && (
        <GeoQuizScoreModal
          play={scoreTarget}
          onClose={() => setScoreTarget(null)}
          onSuccess={refresh}
        />
      )}

      {deleteTarget && (
        <GeoQuizPlayDeleteModal
          play={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
