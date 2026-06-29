"use client";
import React, { useEffect, useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizStats } from "@/types/admin";
import CardDataStats from "@/components/CardDataStats";

const statIcon = (
  <svg className="fill-primary" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 18h2.5v-7H3v7zm5 0h2.5V8H8v10zm5 0h2.5V5H13v13zm5 0H20.5V2H18v16z" fill="" />
  </svg>
);

const DAYS_OPTIONS = [7, 14, 30, 60, 90];

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * 포토 어디게 통계 대시보드.
 * - 요약 카드(총 플레이/고유 참여자/평균·최고 점수/오늘 플레이).
 * - 일별 추이 바(days 선택) + 일별 랭킹 테이블(date 선택).
 */
export default function GeoQuizStatsClient() {
  const [days, setDays] = useState(14);
  const [date, setDate] = useState(todayStr());
  const [stats, setStats] = useState<GeoQuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (d: number, dt: string) => {
    setLoading(true);
    geoQuizApi
      .getStats({ days: d, date: dt })
      .then((res) => {
        setStats(res);
        setError("");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "통계를 불러올 수 없습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(days, date);
  }, [days, date]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxPlays = stats
    ? Math.max(...stats.dailyTrend.map((t) => t.plays), 1)
    : 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          포토 어디게 통계
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          데일리 플레이/참여자/점수 추이와 일별 랭킹을 확인합니다.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">추이 기간</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            {DAYS_OPTIONS.map((d) => (
              <option key={d} value={d}>
                최근 {d}일
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">랭킹 날짜</span>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          />
        </label>
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      {loading || !stats ? (
        <div className="py-10 text-center text-gray-400">불러오는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-5 2xl:gap-7.5">
            <CardDataStats title="총 플레이" total={stats.summary.totalPlays.toLocaleString()} rate="">
              {statIcon}
            </CardDataStats>
            <CardDataStats title="고유 참여자" total={stats.summary.uniquePlayers.toLocaleString()} rate="">
              {statIcon}
            </CardDataStats>
            <CardDataStats title="평균 점수" total={Math.round(stats.summary.avgScore).toLocaleString()} rate="">
              {statIcon}
            </CardDataStats>
            <CardDataStats title="최고 점수" total={stats.summary.maxScore.toLocaleString()} rate="">
              {statIcon}
            </CardDataStats>
            <CardDataStats title="오늘 플레이" total={stats.summary.todayPlays.toLocaleString()} rate="" levelUp>
              {statIcon}
            </CardDataStats>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 일별 추이 바 */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="mb-4 text-sm font-semibold text-black dark:text-white">
                일별 플레이 추이 (최근 {days}일)
              </h3>
              {stats.dailyTrend.length === 0 ? (
                <p className="text-sm text-gray-400">데이터 없음</p>
              ) : (
                <div className="flex h-32 items-end gap-1">
                  {stats.dailyTrend.map((t) => (
                    <div key={t.date} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary"
                        style={{
                          height: `${Math.round((t.plays / maxPlays) * 100)}px`,
                          minHeight: "4px",
                        }}
                        title={`${t.date}\n플레이 ${t.plays} · 참여자 ${t.uniquePlayers} · 평균 ${Math.round(t.avgScore)}`}
                      />
                      <span className="origin-left rotate-45 text-[9px] text-gray-400">
                        {t.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 일별 랭킹 테이블 */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="mb-4 text-sm font-semibold text-black dark:text-white">
                일별 랭킹 — {date}
              </h3>
              {stats.dailyRanking.length === 0 ? (
                <p className="text-sm text-gray-400">해당 날짜의 플레이 기록이 없습니다.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stroke text-left text-gray-500 dark:border-strokedark">
                      <th className="py-2 pr-2 font-medium">순위</th>
                      <th className="py-2 pr-2 font-medium">유저</th>
                      <th className="py-2 pr-2 font-medium">닉네임</th>
                      <th className="py-2 text-right font-medium">총점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dailyRanking.map((r) => (
                      <tr
                        key={`${r.rank}-${r.userId}`}
                        className="border-b border-stroke last:border-0 dark:border-strokedark"
                      >
                        <td className="py-2 pr-2 font-semibold text-primary">{r.rank}</td>
                        <td className="py-2 pr-2 text-gray-500">#{r.userId}</td>
                        <td className="py-2 pr-2 text-black dark:text-white">
                          {r.nickname ?? "(탈퇴/익명)"}
                        </td>
                        <td className="py-2 text-right font-medium text-black dark:text-white">
                          {r.totalScore.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 일별 추이 상세 리스트 */}
          <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                    <th className="px-4 py-3 text-left font-medium">날짜</th>
                    <th className="px-4 py-3 text-right font-medium">플레이</th>
                    <th className="px-4 py-3 text-right font-medium">고유 참여자</th>
                    <th className="px-4 py-3 text-right font-medium">평균 점수</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyTrend.map((t) => (
                    <tr
                      key={t.date}
                      className="border-b border-stroke last:border-0 dark:border-strokedark"
                    >
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{t.date}</td>
                      <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                        {t.plays.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                        {t.uniquePlayers.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                        {Math.round(t.avgScore).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
