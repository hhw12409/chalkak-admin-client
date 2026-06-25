"use client";
import React, { useEffect, useState } from "react";
import { campaignsApi } from "@/lib/api/campaigns";
import {
  Campaign,
  CampaignCreatePayload,
  CampaignUpdatePayload,
} from "@/types/admin";

interface Props {
  mode: "create" | "edit";
  campaign?: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 시즌 캠페인 생성/수정 공용 모달.
 * - title(필수), 기간(startDate/endDate 필수), 나머지 선택.
 * - startDate > endDate 면 클라이언트 사전 검증(서버도 INVALID_PARAMETER).
 */
export default function CampaignFormModal({ mode, campaign, onClose, onSuccess }: Props) {
  const isEdit = mode === "edit" && !!campaign;

  const [title, setTitle] = useState(campaign?.title ?? "");
  const [description, setDescription] = useState(campaign?.description ?? "");
  const [bannerImageUrl, setBannerImageUrl] = useState(campaign?.bannerImageUrl ?? "");
  const [targetTags, setTargetTags] = useState(campaign?.targetTags ?? "");
  const [badgeKey, setBadgeKey] = useState(campaign?.badgeKey ?? "");
  const [startDate, setStartDate] = useState(campaign?.startDate ?? "");
  const [endDate, setEndDate] = useState(campaign?.endDate ?? "");
  const [isActive, setIsActive] = useState(campaign?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setErrorMsg("제목을 입력해주세요.");
      return;
    }
    if (trimmedTitle.length > 200) {
      setErrorMsg("제목은 200자 이하로 입력해주세요.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("시작일과 종료일을 모두 입력해주세요.");
      return;
    }
    if (startDate > endDate) {
      setErrorMsg("시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && campaign) {
        const payload: CampaignUpdatePayload = {
          title: trimmedTitle,
          description: description.trim() || null,
          bannerImageUrl: bannerImageUrl.trim() || null,
          targetTags: targetTags.trim() || null,
          badgeKey: badgeKey.trim() || null,
          startDate,
          endDate,
          isActive,
        };
        await campaignsApi.update(campaign.campaignId, payload);
      } else {
        const payload: CampaignCreatePayload = {
          title: trimmedTitle,
          description: description.trim() || null,
          bannerImageUrl: bannerImageUrl.trim() || null,
          targetTags: targetTags.trim() || null,
          badgeKey: badgeKey.trim() || null,
          startDate,
          endDate,
          isActive,
        };
        await campaignsApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {isEdit ? "캠페인 수정" : "캠페인 등록"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              제목 <span className="text-meta-1">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              placeholder="예: 벚꽃 시즌"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="캠페인 설명"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                시작일 <span className="text-meta-1">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={inputCls}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                종료일 <span className="text-meta-1">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputCls}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">대상 태그</label>
            <input
              type="text"
              value={targetTags}
              onChange={(e) => setTargetTags(e.target.value)}
              maxLength={255}
              placeholder="콤마로 구분 (예: 벚꽃,봄)"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">배지 키</label>
            <input
              type="text"
              value={badgeKey}
              onChange={(e) => setBadgeKey(e.target.value)}
              maxLength={100}
              placeholder="예: SEASON_SAKURA"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">배너 이미지 URL</label>
            <input
              type="text"
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              maxLength={500}
              placeholder="https://..."
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              id="campaign-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4"
            />
            <label htmlFor="campaign-active" className="text-sm">
              활성 (체크 해제 시 사용자에게 노출되지 않음)
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
