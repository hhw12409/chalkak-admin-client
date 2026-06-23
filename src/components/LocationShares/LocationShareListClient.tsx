"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  locationShareApi,
  LocationShareStats,
  LocationShareUser,
} from "@/lib/api/locationShares";
import { PageResponse } from "@/types/admin";
import Pagination from "@/components/common/Pagination";
import MaskedField from "@/components/common/MaskedField";
import CardDataStats from "@/components/CardDataStats";

const statusLabel: Record<string, string> = {
  ACTIVE: "활성",
  DELETED: "탈퇴",
  SUSPENDED: "정지",
};

const PinIcon = () => (
  <svg className="fill-primary dark:fill-white" width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 0.5625C5.8125 0.5625 3.1875 3.1875 3.1875 6.375C3.1875 10.6875 8.4375 16.875 8.6625 17.1375C8.7563 17.25 8.8782 17.3063 9 17.3063C9.1219 17.3063 9.2438 17.25 9.3375 17.1375C9.5625 16.875 14.8125 10.6875 14.8125 6.375C14.8125 3.1875 12.1875 0.5625 9 0.5625ZM9 8.6719C7.7344 8.6719 6.7031 7.6406 6.7031 6.375C6.7031 5.1094 7.7344 4.0781 9 4.0781C10.2656 4.0781 11.2969 5.1094 11.2969 6.375C11.2969 7.6406 10.2656 8.6719 9 8.6719Z" />
  </svg>
);

export default function LocationShareListClient() {
  const router = useRouter();
  const [stats, setStats] = useState<LocationShareStats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [data, setData] = useState<PageResponse<LocationShareUser> | null>(null);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [enabledOnly, setEnabledOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number, kw: string, eo: boolean) => {
    setLoading(true);
    setError("");
    locationShareApi
      .getUsers({
        page: p,
        size: 20,
        keyword: kw || undefined,
        enabledOnly: eo || undefined,
      })
      .then(setData)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "목록을 불러올 수 없습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    locationShareApi
      .getStats()
      .then(setStats)
      .catch((e) =>
        setStatsError(e instanceof Error ? e.message : "통계를 불러올 수 없습니다."),
      );
  }, []);

  useEffect(() => {
    load(page, keyword, enabledOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, enabledOnly]);

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, enabledOnly);
    }, 300);
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">위치공유 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          사용자별 위치공유 현황 조회 + 강제 비활성화 / 공유 관계 삭제 / 실시간 위치 열람(ADMIN).
        </p>
      </div>

      {statsError && <div className="mb-4 text-sm text-meta-1">{statsError}</div>}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardDataStats
          title="전역 공유 활성 유저"
          total={stats ? fmt(stats.globalEnabledUserCount) : "-"}
          rate=""
        >
          <PinIcon />
        </CardDataStats>
        <CardDataStats
          title="공유 중(SHARING) grant"
          total={stats ? fmt(stats.sharingGrantCount) : "-"}
          rate=""
        >
          <PinIcon />
        </CardDataStats>
        <CardDataStats
          title="고스트(GHOST) grant"
          total={stats ? fmt(stats.ghostGrantCount) : "-"}
          rate=""
        >
          <PinIcon />
        </CardDataStats>
        <CardDataStats
          title="전체 grant"
          total={stats ? fmt(stats.totalGrantCount) : "-"}
          rate=""
        >
          <PinIcon />
        </CardDataStats>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="닉네임·이메일 검색"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <label className="flex items-center gap-2 text-sm text-black dark:text-white">
          <input
            type="checkbox"
            checked={enabledOnly}
            onChange={(e) => {
              setEnabledOnly(e.target.checked);
              setPage(0);
            }}
            className="h-4 w-4"
          />
          전역 공유 활성 유저만
        </label>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">ID</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">닉네임</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">이메일</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">전역 공유</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">공유 중</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">고스트</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">상태</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">설정 갱신</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data?.content.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">위치공유 사용자가 없습니다</td></tr>
              ) : (
                data?.content.map((u) => (
                  <tr key={u.userId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.userId}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{u.nickname}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {/* 목록 emailMasked는 마스킹된 문자열 — onReveal 없이 마스킹만 표시 */}
                      <MaskedField value={u.emailMasked} masked />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        u.globalEnabled ? "bg-meta-3/10 text-meta-3" : "bg-gray-100 text-gray-500 dark:bg-meta-4 dark:text-gray-400"
                      }`}>
                        {u.globalEnabled ? "ON" : "OFF"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.sharingCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.ghostCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        u.status === "ACTIVE" ? "bg-meta-3/10 text-meta-3" :
                        u.status === "DELETED" ? "bg-meta-5/10 text-meta-5" : "bg-meta-6/10 text-meta-6"
                      }`}>
                        {statusLabel[u.status] ?? u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {u.settingUpdatedAt ? u.settingUpdatedAt.replace("T", " ").slice(0, 16) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/location-shares/${u.userId}`)}
                        className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-opacity-90"
                      >
                        상세보기
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
            itemLabel="명"
          />
        )}
      </div>
    </div>
  );
}
