"use client";
import React, { useEffect, useState } from "react";
import { missionsApi } from "@/lib/api/missions";
import { Mission, MissionCreatePayload, MissionUpdatePayload } from "@/types/mission";
import MissionTable from "./MissionTable";
import MissionFormModal from "./MissionFormModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type ActiveFilter = "all" | "true" | "false";

type ModalState =
  | { kind: "create" }
  | { kind: "edit"; mission: Mission }
  | null;

export default function MissionListClient() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [confirmTarget, setConfirmTarget] = useState<Mission | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const active =
      activeFilter === "all" ? undefined : activeFilter === "true";
    missionsApi
      .listMissions(active)
      .then(setMissions)
      .catch((e) => setError(e instanceof Error ? e.message : "조회 실패"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const handleCreate = async (payload: MissionCreatePayload) => {
    await missionsApi.createMission(payload);
    setModal(null);
    load();
  };

  const handleUpdate = async (missionKey: string, payload: MissionUpdatePayload) => {
    await missionsApi.updateMission(missionKey, payload);
    setModal(null);
    load();
  };

  const handleDeactivate = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await missionsApi.deactivateMission(confirmTarget.missionKey);
      setConfirmTarget(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "비활성화 실패");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReactivate = async (mission: Mission) => {
    try {
      await missionsApi.updateMission(mission.missionKey, { active: true });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "재활성 실패");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-black dark:text-white">미션 관리</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-body dark:text-bodydark">
            활성 필터
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
          <button
            onClick={() => setModal({ kind: "create" })}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            + 신규 미션
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : (
          <MissionTable
            missions={missions}
            onEdit={(m) => setModal({ kind: "edit", mission: m })}
            onDeactivate={(m) => setConfirmTarget(m)}
            onReactivate={handleReactivate}
          />
        )}
      </div>

      {modal?.kind === "create" && (
        <MissionFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}
      {modal?.kind === "edit" && (
        <MissionFormModal
          mode="edit"
          mission={modal.mission}
          onClose={() => setModal(null)}
          onSubmit={(payload) => handleUpdate(modal.mission.missionKey, payload)}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="미션 비활성화"
        message={
          confirmTarget
            ? `"${confirmTarget.title}" (${confirmTarget.missionKey}) 미션을 비활성화합니다.\n클라이언트에 즉시 노출되지 않으며, 감사 로그가 남습니다.\n진행하시겠습니까?`
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
