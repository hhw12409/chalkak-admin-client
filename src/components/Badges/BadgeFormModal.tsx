"use client";
import React, { useEffect, useState } from "react";
import {
  BADGE_CATEGORIES,
  BADGE_CATEGORY_LABELS,
  BADGE_CONDITION_TYPES,
  BADGE_CONDITION_TYPE_LABELS,
  Badge,
  BadgeCategory,
  BadgeConditionType,
  BadgeCreatePayload,
  BadgeTier,
  BadgeUpdatePayload,
} from "@/types/badge";
import BadgeIcon from "./BadgeIcon";
import BadgeIconPicker from "./BadgeIconPicker";
import BadgeGradientPicker from "./BadgeGradientPicker";
import BadgeTierPicker from "./BadgeTierPicker";

interface CreateMode {
  mode: "create";
  onSubmit: (payload: BadgeCreatePayload) => Promise<void>;
}

interface EditMode {
  mode: "edit";
  badge: Badge;
  onSubmit: (payload: BadgeUpdatePayload) => Promise<void>;
}

type Props = (CreateMode | EditMode) & {
  onClose: () => void;
};

const KEY_REGEX = /^[A-Z][A-Z0-9_]*$/;

interface FormState {
  badgeKey: string;
  name: string;
  description: string;
  iconUrl: string;
  iconKey: string | null;
  gradientKey: string | null;
  tier: BadgeTier | null;
  category: BadgeCategory;
  conditionType: BadgeConditionType;
  conditionValue: number;
  sortOrder: number;
  active: boolean;
  hidden: boolean;
}

function initialForm(props: Props): FormState {
  if (props.mode === "edit") {
    const b = props.badge;
    return {
      badgeKey: b.badgeKey,
      name: b.name,
      description: b.description,
      iconUrl: b.iconUrl ?? "",
      iconKey: b.iconKey ?? null,
      gradientKey: b.gradientKey ?? null,
      tier: b.tier ?? null,
      category: b.category,
      conditionType: b.conditionType,
      conditionValue: b.conditionValue,
      sortOrder: b.sortOrder,
      active: b.active,
      hidden: b.hidden,
    };
  }
  return {
    badgeKey: "",
    name: "",
    description: "",
    iconUrl: "",
    iconKey: null,
    gradientKey: null,
    tier: null,
    category: "WRITING",
    conditionType: "POST_COUNT",
    conditionValue: 1,
    sortOrder: 0,
    active: true,
    hidden: false,
  };
}

export default function BadgeFormModal(props: Props) {
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
      if (!KEY_REGEX.test(form.badgeKey)) {
        setError(
          "키는 영문 대문자로 시작하고 영문 대문자/숫자/언더스코어만 사용할 수 있습니다.",
        );
        return;
      }
    }
    if (!form.name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!form.description.trim()) {
      setError("설명을 입력해주세요.");
      return;
    }
    if (form.conditionValue < 1) {
      setError("조건 값은 1 이상이어야 합니다.");
      return;
    }

    setSubmitting(true);
    try {
      const iconUrl = form.iconUrl.trim() || null;
      const iconKey = form.iconKey || null;
      const gradientKey = form.gradientKey || null;
      const tier = form.tier || null;
      if (props.mode === "create") {
        await props.onSubmit({
          badgeKey: form.badgeKey,
          name: form.name,
          description: form.description,
          iconUrl,
          iconKey,
          gradientKey,
          tier,
          category: form.category,
          conditionType: form.conditionType,
          conditionValue: form.conditionValue,
          sortOrder: form.sortOrder,
          active: form.active,
          hidden: form.hidden,
        });
      } else {
        await props.onSubmit({
          name: form.name,
          description: form.description,
          iconUrl,
          iconKey,
          gradientKey,
          tier,
          category: form.category,
          conditionType: form.conditionType,
          conditionValue: form.conditionValue,
          sortOrder: form.sortOrder,
          active: form.active,
          hidden: form.hidden,
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {isEdit ? "뱃지 편집" : "신규 뱃지"}
        </h3>

        {isEdit && (
          <p className="mb-4 rounded border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
            키는 데이터 무결성을 위해 변경할 수 없습니다. 변경이 필요한 경우 기존
            뱃지를 비활성화하고 신규 키로 추가하세요.
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
              뱃지 키 {isEdit && <span className="text-xs text-gray-500">(변경 불가)</span>}
            </label>
            <input
              type="text"
              value={form.badgeKey}
              onChange={(e) =>
                setForm((f) => ({ ...f, badgeKey: e.target.value.toUpperCase() }))
              }
              required
              disabled={isEdit}
              readOnly={isEdit}
              placeholder="예: FIRST_POST"
              pattern="^[A-Z][A-Z0-9_]*$"
              maxLength={50}
              className="w-full rounded border border-stroke px-3 py-2 text-sm disabled:bg-gray-1 dark:border-strokedark dark:bg-form-input dark:text-white dark:disabled:bg-meta-4"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">아이콘 URL</label>
            <input
              type="text"
              value={form.iconUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, iconUrl: e.target.value }))
              }
              maxLength={500}
              placeholder="https://... (선택)"
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              이미지 URL이 있으면 최우선으로 표시됩니다.
            </p>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium">
                Lucide 아이콘 {form.iconKey && <span className="ml-1 font-mono text-xs text-gray-500">({form.iconKey})</span>}
              </label>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>미리보기</span>
                <BadgeIcon
                  name={form.name || "preview"}
                  iconUrl={form.iconUrl.trim() || null}
                  iconKey={form.iconKey}
                  gradientKey={form.gradientKey}
                  tier={form.tier}
                  category={form.category}
                  size="md"
                />
              </div>
            </div>
            <BadgeIconPicker
              value={form.iconKey}
              onChange={(key) => setForm((f) => ({ ...f, iconKey: key }))}
            />
            <p className="mt-1 text-xs text-gray-500">
              이미지 URL이 없을 때 사용됩니다. 둘 다 비워두면 카테고리별 기본 아이콘.
            </p>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              그라데이션 색상 {form.gradientKey && <span className="ml-1 font-mono text-xs text-gray-500">({form.gradientKey})</span>}
            </label>
            <BadgeGradientPicker
              value={form.gradientKey}
              onChange={(key) => setForm((f) => ({ ...f, gradientKey: key }))}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              뱃지 등급 {form.tier && <span className="ml-1 font-mono text-xs text-gray-500">({form.tier})</span>}
            </label>
            <BadgeTierPicker
              value={form.tier}
              onChange={(key) => setForm((f) => ({ ...f, tier: key }))}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">카테고리</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as BadgeCategory,
                  }))
                }
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              >
                {BADGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {BADGE_CATEGORY_LABELS[c]} ({c})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">조건 타입</label>
              <select
                value={form.conditionType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    conditionType: e.target.value as BadgeConditionType,
                  }))
                }
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              >
                {BADGE_CONDITION_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {BADGE_CONDITION_TYPE_LABELS[c]} ({c})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">조건 값</label>
              <input
                type="number"
                value={form.conditionValue}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    conditionValue: Number(e.target.value),
                  }))
                }
                min={1}
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

          <div className="mb-6 flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
              />
              활성
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hidden: e.target.checked }))
                }
              />
              숨김 (조건 충족 전 비공개)
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
