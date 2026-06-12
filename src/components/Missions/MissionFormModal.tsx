"use client";
import React, { useEffect, useState } from "react";
import {
  MISSION_TARGET_TYPE_LABELS,
  Mission,
  MissionCreatePayload,
  MissionTargetType,
  MissionUpdatePayload,
} from "@/types/mission";

interface CreateMode {
  mode: "create";
  onSubmit: (payload: MissionCreatePayload) => Promise<void>;
}

interface EditMode {
  mode: "edit";
  mission: Mission;
  onSubmit: (payload: MissionUpdatePayload) => Promise<void>;
}

type Props = (CreateMode | EditMode) & {
  onClose: () => void;
};

const KEY_REGEX = /^[A-Z][A-Z0-9_]*$/;

const TARGET_TYPES: MissionTargetType[] = [
  "LIKE_GIVEN",
  "POST_CREATED",
  "MAP_VIEW",
  "COMMENT_CREATED",
];

interface FormState {
  missionKey: string;
  title: string;
  description: string;
  targetType: MissionTargetType;
  targetCount: number;
  rewardPoint: number;
  sortOrder: number;
  active: boolean;
}

function initialForm(props: Props): FormState {
  if (props.mode === "edit") {
    const m = props.mission;
    return {
      missionKey: m.missionKey,
      title: m.title,
      description: m.description,
      targetType: m.targetType,
      targetCount: m.targetCount,
      rewardPoint: m.rewardPoint,
      sortOrder: m.sortOrder,
      active: m.active,
    };
  }
  return {
    missionKey: "",
    title: "",
    description: "",
    targetType: "LIKE_GIVEN",
    targetCount: 1,
    rewardPoint: 10,
    sortOrder: 0,
    active: true,
  };
}

export default function MissionFormModal(props: Props) {
  const [form, setForm] = useState<FormState>(() => initialForm(props));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) props.onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [submitting, props]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (props.mode === "create") {
      if (!KEY_REGEX.test(form.missionKey)) {
        setError(
          "키는 영문 대문자로 시작하고 영문 대문자/숫자/언더스코어만 사용할 수 있습니다.",
        );
        return;
      }
    }
    if (!form.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!form.description.trim()) {
      setError("설명을 입력해주세요.");
      return;
    }
    if (form.targetCount < 1) {
      setError("목표 횟수는 1 이상이어야 합니다.");
      return;
    }
    if (form.rewardPoint < 0) {
      setError("보상 포인트는 0 이상이어야 합니다.");
      return;
    }

    setSubmitting(true);
    try {
      if (props.mode === "create") {
        await props.onSubmit({
          missionKey: form.missionKey,
          title: form.title,
          description: form.description,
          targetType: form.targetType,
          targetCount: form.targetCount,
          rewardPoint: form.rewardPoint,
          sortOrder: form.sortOrder,
          active: form.active,
        });
      } else {
        await props.onSubmit({
          title: form.title,
          description: form.description,
          targetType: form.targetType,
          targetCount: form.targetCount,
          rewardPoint: form.rewardPoint,
          sortOrder: form.sortOrder,
          active: form.active,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = props.mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => !submitting && props.onClose()}
    >
      <div
        className="w-full max-w-xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {isEdit ? "미션 편집" : "신규 미션"}
        </h3>

        {isEdit && (
          <p className="mb-4 rounded border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
            키는 데이터 무결성을 위해 변경할 수 없습니다. 변경이 필요한 경우 기존
            미션을 비활성화하고 신규 키로 추가하세요.
          </p>
        )}

        {error && (
          <div className="mb-4 rounded bg-meta-1/10 px-3 py-2 text-sm text-meta-1">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              미션 키 {isEdit && <span className="text-xs text-gray-500">(변경 불가)</span>}
            </label>
            <input
              type="text"
              value={form.missionKey}
              onChange={(e) =>
                setForm((f) => ({ ...f, missionKey: e.target.value.toUpperCase() }))
              }
              required
              disabled={isEdit}
              readOnly={isEdit}
              placeholder="예: LIKE_FIVE"
              pattern="^[A-Z][A-Z0-9_]*$"
              maxLength={50}
              className="w-full rounded border border-stroke px-3 py-2 text-sm disabled:bg-gray-1 dark:border-strokedark dark:bg-form-input dark:text-white dark:disabled:bg-meta-4"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">제목</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              maxLength={100}
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">설명</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
              maxLength={255}
              rows={2}
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">목표 타입</label>
              <select
                value={form.targetType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    targetType: e.target.value as MissionTargetType,
                  }))
                }
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              >
                {TARGET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MISSION_TARGET_TYPE_LABELS[t]} ({t})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">목표 횟수</label>
              <input
                type="number"
                value={form.targetCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetCount: Number(e.target.value) }))
                }
                min={1}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">보상 포인트</label>
              <input
                type="number"
                value={form.rewardPoint}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rewardPoint: Number(e.target.value) }))
                }
                min={0}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">정렬 순서</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
                }
                min={0}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
              />
              활성 상태
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={props.onClose}
              disabled={submitting}
              className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1 disabled:opacity-60 dark:border-strokedark dark:hover:bg-meta-4"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {submitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
