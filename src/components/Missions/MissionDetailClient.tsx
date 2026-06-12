"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { missionsApi } from "@/lib/api/missions";
import {
  MISSION_TARGET_TYPE_LABELS,
  Mission,
  MissionUpdatePayload,
} from "@/types/mission";
import MissionFormModal from "./MissionFormModal";
import MissionStatsPanel from "./MissionStatsPanel";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Props {
  missionKey: string;
}

export default function MissionDetailClient({ missionKey }: Props) {
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = () => {
    setLoading(true);
    missionsApi
      .getMission(missionKey)
      .then(setMission)
      .catch((e) => setError(e instanceof Error ? e.message : "조회 실패"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionKey]);

  const handleUpdate = async (payload: MissionUpdatePayload) => {
    await missionsApi.updateMission(missionKey, payload);
    setEditOpen(false);
    load();
  };

  const handleDeactivate = async () => {
    setConfirmLoading(true);
    try {
      await missionsApi.deactivateMission(missionKey);
      setConfirmOpen(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "비활성화 실패");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await missionsApi.updateMission(missionKey, { active: true });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "재활성 실패");
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-400">불러오는 중...</div>;
  }
  if (error) {
    return <div className="py-10 text-center text-meta-1">{error}</div>;
  }
  if (!mission) {
    return <div className="py-10 text-center text-gray-400">미션 없음</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/missions"
            className="text-sm text-primary hover:underline"
          >
            ← 미션 목록
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-black dark:text-white">
            {mission.title}
          </h1>
          <div className="font-mono text-xs text-gray-500">{mission.missionKey}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            편집
          </button>
          {mission.active ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90"
            >
              비활성화
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              className="rounded bg-success px-4 py-2 text-sm text-white hover:bg-opacity-90"
            >
              재활성
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
            미션 정보
          </h4>
          <dl className="space-y-3 text-sm">
            <Row label="설명" value={mission.description} />
            <Row
              label="목표 타입"
              value={`${MISSION_TARGET_TYPE_LABELS[mission.targetType]} (${mission.targetType})`}
            />
            <Row label="목표 횟수" value={mission.targetCount.toString()} />
            <Row label="보상 포인트" value={`${mission.rewardPoint} P`} />
            <Row label="정렬 순서" value={mission.sortOrder.toString()} />
            <Row
              label="활성"
              value={mission.active ? "활성" : "비활성"}
              valueClassName={
                mission.active ? "text-success" : "text-gray-500"
              }
            />
            <Row label="생성일" value={mission.createdAt} />
            <Row label="수정일" value={mission.updatedAt} />
          </dl>
        </div>

        <MissionStatsPanel missionKey={missionKey} />
      </div>

      {editOpen && (
        <MissionFormModal
          mode="edit"
          mission={mission}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="미션 비활성화"
        message={`"${mission.title}" (${mission.missionKey}) 미션을 비활성화합니다.\n클라이언트에 즉시 노출되지 않으며, 감사 로그가 남습니다.\n진행하시겠습니까?`}
        confirmLabel="비활성화"
        confirmTone="danger"
        loading={confirmLoading}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <dt className="w-32 shrink-0 text-gray-500">{label}</dt>
      <dd
        className={`text-black dark:text-white ${valueClassName ?? ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
