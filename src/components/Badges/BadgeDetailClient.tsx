"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { badgesApi } from "@/lib/api/badges";
import {
  BADGE_CATEGORY_LABELS,
  BADGE_CONDITION_TYPE_LABELS,
  Badge,
  BadgeStats,
  BadgeUpdatePayload,
} from "@/types/badge";
import BadgeFormModal from "./BadgeFormModal";
import BadgeIcon from "./BadgeIcon";
import BadgeStatsChart from "./BadgeStatsChart";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Props {
  badgeKey: string;
}

export default function BadgeDetailClient({ badgeKey }: Props) {
  const [badge, setBadge] = useState<Badge | null>(null);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      badgesApi.getBadge(badgeKey),
      badgesApi.getBadgeStats(badgeKey),
    ])
      .then(([b, s]) => {
        setBadge(b);
        setStats(s);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "조회 실패"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badgeKey]);

  const handleUpdate = async (payload: BadgeUpdatePayload) => {
    await badgesApi.updateBadge(badgeKey, payload);
    setEditOpen(false);
    load();
  };

  const handleDeactivate = async () => {
    setConfirmLoading(true);
    try {
      await badgesApi.deactivateBadge(badgeKey);
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
      await badgesApi.updateBadge(badgeKey, { active: true });
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
  if (!badge || !stats) {
    return <div className="py-10 text-center text-gray-400">뱃지 없음</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/badges" className="text-sm text-primary hover:underline">
            ← 뱃지 목록
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-black dark:text-white">
            {badge.name}
          </h1>
          <div className="font-mono text-xs text-gray-500">{badge.badgeKey}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            편집
          </button>
          {badge.active ? (
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
            뱃지 정보
          </h4>

          <div className="mb-4">
            <BadgeIcon
              name={badge.name}
              iconUrl={badge.iconUrl}
              category={badge.category}
              size="lg"
            />
          </div>

          <dl className="space-y-3 text-sm">
            <Row label="설명" value={badge.description} />
            <Row
              label="카테고리"
              value={`${BADGE_CATEGORY_LABELS[badge.category]} (${badge.category})`}
            />
            <Row
              label="조건"
              value={`${BADGE_CONDITION_TYPE_LABELS[badge.conditionType]} ≥ ${badge.conditionValue} (${badge.conditionType})`}
            />
            <Row label="정렬 순서" value={badge.sortOrder.toString()} />
            <Row
              label="활성"
              value={badge.active ? "활성" : "비활성"}
              valueClassName={badge.active ? "text-success" : "text-gray-500"}
            />
            <Row label="숨김" value={badge.hidden ? "예" : "아니오"} />
            <Row label="아이콘 URL" value={badge.iconUrl ?? "-"} />
            <Row label="생성일" value={badge.createdAt} />
            <Row label="수정일" value={badge.updatedAt} />
          </dl>
        </div>

        <BadgeStatsChart stats={stats} />
      </div>

      {editOpen && (
        <BadgeFormModal
          mode="edit"
          badge={badge}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="뱃지 비활성화"
        message={`"${badge.name}" (${badge.badgeKey}) 뱃지를 비활성화합니다.\n클라이언트에 즉시 노출되지 않으며, 감사 로그가 남습니다.\n진행하시겠습니까?`}
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
        className={`min-w-0 break-all text-black dark:text-white ${valueClassName ?? ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
