"use client";
import React, { useEffect, useState } from "react";
import { badgesApi } from "@/lib/api/badges";
import {
  BADGE_CATEGORIES,
  BADGE_CATEGORY_LABELS,
  Badge,
  BadgeCategory,
  BadgeCreatePayload,
  BadgeUpdatePayload,
} from "@/types/badge";
import BadgeGrid from "./BadgeGrid";
import BadgeFormModal from "./BadgeFormModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type ActiveFilter = "all" | "true" | "false";

type CategoryFilter = "all" | BadgeCategory;

type ModalState =
  | { kind: "create" }
  | { kind: "edit"; badge: Badge }
  | null;

export default function BadgeGridClient() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [confirmTarget, setConfirmTarget] = useState<Badge | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const active =
      activeFilter === "all" ? undefined : activeFilter === "true";
    const category =
      categoryFilter === "all" ? undefined : categoryFilter;
    badgesApi
      .listBadges({ active, category })
      .then(setBadges)
      .catch((e) => setError(e instanceof Error ? e.message : "조회 실패"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, categoryFilter]);

  const handleCreate = async (payload: BadgeCreatePayload) => {
    await badgesApi.createBadge(payload);
    setModal(null);
    load();
  };

  const handleUpdate = async (badgeKey: string, payload: BadgeUpdatePayload) => {
    await badgesApi.updateBadge(badgeKey, payload);
    setModal(null);
    load();
  };

  const handleDeactivate = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await badgesApi.deactivateBadge(confirmTarget.badgeKey);
      setConfirmTarget(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "비활성화 실패");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReactivate = async (badge: Badge) => {
    try {
      await badgesApi.updateBadge(badge.badgeKey, { active: true });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "재활성 실패");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-black dark:text-white">뱃지 관리</h1>
        <button
          onClick={() => setModal({ kind: "create" })}
          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
        >
          + 신규 뱃지
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          <FilterChip
            label="전체"
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          />
          {BADGE_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              label={`${BADGE_CATEGORY_LABELS[c]} (${c})`}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
            />
          ))}
        </div>
        <label className="ml-auto text-sm text-body dark:text-bodydark">
          활성
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
            className="ml-2 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          >
            <option value="all">전체</option>
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>
        </label>
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      {loading ? (
        <div className="rounded-sm border border-stroke bg-white py-10 text-center text-gray-400 dark:border-strokedark dark:bg-boxdark">
          불러오는 중...
        </div>
      ) : (
        <BadgeGrid
          badges={badges}
          onEdit={(b) => setModal({ kind: "edit", badge: b })}
          onDeactivate={(b) => setConfirmTarget(b)}
          onReactivate={handleReactivate}
        />
      )}

      {modal?.kind === "create" && (
        <BadgeFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}
      {modal?.kind === "edit" && (
        <BadgeFormModal
          mode="edit"
          badge={modal.badge}
          onClose={() => setModal(null)}
          onSubmit={(payload) => handleUpdate(modal.badge.badgeKey, payload)}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="뱃지 비활성화"
        message={
          confirmTarget
            ? `"${confirmTarget.name}" (${confirmTarget.badgeKey}) 뱃지를 비활성화합니다.\n클라이언트에 즉시 노출되지 않으며, 감사 로그가 남습니다.\n진행하시겠습니까?`
            : ""
        }
        confirmLabel="비활성화"
        confirmTone="danger"
        loading={confirmLoading}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-primary bg-primary text-white"
          : "border-stroke bg-white text-body hover:bg-gray-1 dark:border-strokedark dark:bg-boxdark dark:text-bodydark dark:hover:bg-meta-4"
      }`}
    >
      {label}
    </button>
  );
}
