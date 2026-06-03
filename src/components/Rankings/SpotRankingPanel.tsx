"use client";
import React, { useEffect, useState } from "react";
import { spotRankingsApi } from "@/lib/api/spotRankings";
import { SpotRanking, SpotRankingPeriod } from "@/types/admin";

const MEDALS = ["🥇", "🥈", "🥉"];

const PERIOD_OPTIONS: { value: SpotRankingPeriod; label: string }[] = [
  { value: "ALL_TIME", label: "전체" },
  { value: "WEEKLY", label: "주간" },
  { value: "MONTHLY", label: "월간" },
];

export default function SpotRankingPanel() {
  const [period, setPeriod] = useState<SpotRankingPeriod>("ALL_TIME");
  const [data, setData] = useState<SpotRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    spotRankingsApi
      .getSpotRanking(period)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col gap-2 border-b border-stroke px-6 py-4 dark:border-strokedark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-black dark:text-white">
            운영 서비스 노출 랭킹 (포토스팟)
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            실제 앱에서 보이는 포토스팟 랭킹과 동일합니다. 운영 서비스 캐시 영향으로 최대 10분 지연이 발생할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="period-select"
            className="text-sm text-gray-500 dark:text-bodydark"
          >
            기간
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as SpotRankingPeriod)}
            className="rounded border border-stroke bg-transparent px-3 py-1.5 text-sm text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="px-6 py-4 text-sm text-red-500">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-3 text-left font-medium w-16">순위</th>
              <th className="px-4 py-3 text-left font-medium w-20">썸네일</th>
              <th className="px-4 py-3 text-left font-medium">위치명</th>
              <th className="px-4 py-3 text-left font-medium w-40">좌표</th>
              <th className="px-4 py-3 text-right font-medium w-28">게시글 수</th>
              <th className="px-4 py-3 text-right font-medium w-28">좋아요 합계</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  데이터 없음
                </td>
              </tr>
            ) : (
              data.map((spot, idx) => {
                const name = spot.locationName?.trim() || "이름 없는 스팟";
                return (
                  <tr
                    key={`${spot.rank}-${spot.latitude}-${spot.longitude}`}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-center font-bold">
                      {idx < 3 ? (
                        <span className="text-base">{MEDALS[idx]}</span>
                      ) : (
                        <span className="text-gray-500">{spot.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {spot.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={spot.thumbnailUrl}
                          alt={name}
                          className="h-12 w-12 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.removeAttribute("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        hidden={!!spot.thumbnailUrl}
                        className="h-12 w-12 rounded bg-gray-2 dark:bg-meta-4"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">
                      {name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      {spot.articleCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-black dark:text-white">
                      {spot.totalLikes.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
