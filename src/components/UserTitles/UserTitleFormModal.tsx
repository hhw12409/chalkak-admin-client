"use client";
import React, { useEffect, useState } from "react";
import { userTitlesApi } from "@/lib/api/userTitles";
import {
  UserTitle,
  UserTitleCreatePayload,
  UserTitleUpdatePayload,
} from "@/types/admin";

interface Props {
  mode: "create" | "edit";
  /** edit 모드일 때 원본 row */
  title?: UserTitle | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 직책 마스터 생성/수정 공용 모달.
 * - label(필수, 1~30자, trim)
 * - displayOrder(선택, 0 이상 정수; 생성 시 비우면 서버 자동 할당)
 * - isActive(체크박스, 기본 true)
 */
export default function UserTitleFormModal({ mode, title, onClose, onSuccess }: Props) {
  const isEdit = mode === "edit" && title;
  const [label, setLabel] = useState<string>(title?.label ?? "");
  const [displayOrder, setDisplayOrder] = useState<string>(
    title ? String(title.displayOrder) : ""
  );
  const [isActive, setIsActive] = useState<boolean>(title?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = label.trim();
    if (trimmed.length === 0) {
      setErrorMsg("직책명을 입력해주세요.");
      return;
    }
    if (trimmed.length > 30) {
      setErrorMsg("직책명은 30자 이하로 입력해주세요.");
      return;
    }

    let orderValue: number | null = null;
    if (displayOrder.trim() !== "") {
      const parsed = Number(displayOrder);
      if (!Number.isInteger(parsed) || parsed < 0) {
        setErrorMsg("정렬 순서는 0 이상의 정수여야 합니다.");
        return;
      }
      orderValue = parsed;
    }

    setSubmitting(true);
    try {
      if (isEdit && title) {
        const payload: UserTitleUpdatePayload = {};
        if (trimmed !== title.label) payload.label = trimmed;
        if (orderValue !== null && orderValue !== title.displayOrder) {
          payload.displayOrder = orderValue;
        }
        if (isActive !== title.isActive) payload.isActive = isActive;

        if (Object.keys(payload).length === 0) {
          setErrorMsg("변경된 내용이 없습니다.");
          setSubmitting(false);
          return;
        }
        await userTitlesApi.update(title.id, payload);
      } else {
        const payload: UserTitleCreatePayload = {
          label: trimmed,
          displayOrder: orderValue,
          isActive,
        };
        await userTitlesApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "저장에 실패했습니다.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {isEdit ? "직책 수정" : "직책 등록"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              직책명 <span className="text-meta-1">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={30}
              required
              placeholder="예: 포토그래퍼"
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              좌우 공백은 자동으로 제거됩니다. 최대 30자. ({label.length}/30)
            </p>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">정렬 순서</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              min={0}
              placeholder={isEdit ? "" : "비워두면 마지막 순서로 자동 지정"}
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              0 이상의 정수. 동일 값 허용(정렬은 displayOrder ASC, id ASC).
            </p>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              id="user-title-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4"
            />
            <label htmlFor="user-title-active" className="text-sm">
              활성 (비활성 시 사용자에게 부여 불가)
            </label>
          </div>

          {errorMsg && <div className="mb-4 text-sm text-meta-1">{errorMsg}</div>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
