"use client";
import React, { useEffect, useState } from "react";
import { missionsApi } from "@/lib/api/missions";
import { MissionStats } from "@/types/mission";

interface Props {
  missionKey: string;
}

function todayKst(): string {
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

export default function MissionStatsPanel({ missionKey }: Props) {
  const [date, setDate] = useState<string>(todayKst());
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    missionsApi
      .getMissionStats(missionKey, date)
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "통계 조회 실패"))
      .finally(() => setLoading(false));
  }, [missionKey, date]);

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-black dark:text-white">
          일자별 통계
        </h4>
        <input
          type="date"
          value={date}
          // H-5: 빈 값으로 지우면 KST 오늘로 스냅백 — 빈 입력에서 서버가 default(오늘) 채워주는 동작 혼동 방지
          onChange={(e) => setDate(e.target.value || todayKst())}
          className="rounded border border-stroke px-3 py-1.5 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
        />
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-gray-400">불러오는 중...</div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="참여자 수" value={stats.participantCount} />
          <StatCard label="완료자 수" value={stats.completedCount} />
          <StatCard label="claim 수" value={stats.claimedCount} />
          <StatCard
            label="claim 포인트 합 (추정치)"
            value={stats.claimedRewardSum}
            suffix="P"
            tooltip="현재 보상 단가 × claim 수로 계산됩니다. 운영자가 보상값을 변경한 후 과거 일자를 조회하면 실제 지급량과 차이가 날 수 있습니다."
          />
        </div>
      ) : (
        <div className="py-10 text-center text-gray-400">데이터 없음</div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  tooltip,
}: {
  label: string;
  value: number;
  suffix?: string;
  tooltip?: string;
}) {
  return (
    <div className="rounded border border-stroke p-4 dark:border-strokedark">
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span>{label}</span>
        {tooltip && (
          <span
            title={tooltip}
            className="cursor-help text-gray-400"
            aria-label={tooltip}
          >
            ⓘ
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-black dark:text-white">
        {value.toLocaleString()}
        {suffix && <span className="ml-1 text-sm font-medium">{suffix}</span>}
      </div>
    </div>
  );
}
