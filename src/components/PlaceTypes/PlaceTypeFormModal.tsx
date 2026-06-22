"use client";
import React, { useEffect, useState } from "react";
import { placeTypesApi } from "@/lib/api/placeTypes";
import {
  PlaceType,
  PlaceTypeCreatePayload,
  PlaceTypeUpdatePayload,
} from "@/types/admin";

interface Props {
  mode: "create" | "edit";
  /** edit 모드일 때 원본 row */
  placeType?: PlaceType | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 장소 타입 마스터 생성/수정 공용 모달.
 * - typeName(필수, 1~30자, trim)
 */
export default function PlaceTypeFormModal({ mode, placeType, onClose, onSuccess }: Props) {
  const isEdit = mode === "edit" && placeType;
  const [typeName, setTypeName] = useState<string>(placeType?.typeName ?? "");
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

    const trimmed = typeName.trim();
    if (trimmed.length === 0) {
      setErrorMsg("장소 타입명을 입력해주세요.");
      return;
    }
    if (trimmed.length > 30) {
      setErrorMsg("장소 타입명은 30자 이하로 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && placeType) {
        if (trimmed === placeType.typeName) {
          setErrorMsg("변경된 내용이 없습니다.");
          setSubmitting(false);
          return;
        }
        const payload: PlaceTypeUpdatePayload = { typeName: trimmed };
        await placeTypesApi.update(placeType.typeId, payload);
      } else {
        const payload: PlaceTypeCreatePayload = { typeName: trimmed };
        await placeTypesApi.create(payload);
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
          {isEdit ? "장소 타입 수정" : "장소 타입 등록"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              장소 타입명 <span className="text-meta-1">*</span>
            </label>
            <input
              type="text"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              maxLength={30}
              required
              placeholder="예: 카페"
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              좌우 공백은 자동으로 제거됩니다. 최대 30자. ({typeName.length}/30)
            </p>
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
