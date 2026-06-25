"use client";
import React, { useEffect, useState } from "react";
import { regionsApi } from "@/lib/api/regions";
import { Region, RegionCreatePayload, RegionUpdatePayload } from "@/types/admin";

interface Props {
  mode: "create" | "edit";
  region?: Region | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 지역 bbox 마스터 생성/수정 모달.
 * - name(필수), lat/lng bbox + center + displayOrder + active.
 * - latMin<latMax, lngMin<lngMax 클라이언트 사전 검증(서버도 INVALID_PARAMETER).
 */
export default function RegionFormModal({ mode, region, onClose, onSuccess }: Props) {
  const isEdit = mode === "edit" && !!region;

  const [name, setName] = useState(region?.name ?? "");
  const [latMin, setLatMin] = useState(region ? String(region.latMin) : "");
  const [latMax, setLatMax] = useState(region ? String(region.latMax) : "");
  const [lngMin, setLngMin] = useState(region ? String(region.lngMin) : "");
  const [lngMax, setLngMax] = useState(region ? String(region.lngMax) : "");
  const [centerLat, setCenterLat] = useState(region ? String(region.centerLat) : "");
  const [centerLng, setCenterLng] = useState(region ? String(region.centerLng) : "");
  const [displayOrder, setDisplayOrder] = useState(
    region ? String(region.displayOrder) : "",
  );
  const [active, setActive] = useState(region?.active ?? true);
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

  const parseNum = (v: string): number | null => {
    if (v.trim() === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setErrorMsg("지역명을 입력해주세요.");
      return;
    }
    if (trimmedName.length > 30) {
      setErrorMsg("지역명은 30자 이하로 입력해주세요.");
      return;
    }

    const nums = {
      latMin: parseNum(latMin),
      latMax: parseNum(latMax),
      lngMin: parseNum(lngMin),
      lngMax: parseNum(lngMax),
      centerLat: parseNum(centerLat),
      centerLng: parseNum(centerLng),
    };
    const entries = Object.entries(nums);
    for (const [k, v] of entries) {
      if (v === null || Number.isNaN(v)) {
        setErrorMsg(`${k} 값을 올바른 숫자로 입력해주세요.`);
        return;
      }
    }
    if ((nums.latMin as number) >= (nums.latMax as number)) {
      setErrorMsg("latMin은 latMax보다 작아야 합니다.");
      return;
    }
    if ((nums.lngMin as number) >= (nums.lngMax as number)) {
      setErrorMsg("lngMin은 lngMax보다 작아야 합니다.");
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
      const base = {
        name: trimmedName,
        latMin: nums.latMin as number,
        latMax: nums.latMax as number,
        lngMin: nums.lngMin as number,
        lngMax: nums.lngMax as number,
        centerLat: nums.centerLat as number,
        centerLng: nums.centerLng as number,
        active,
      };
      if (isEdit && region) {
        const payload: RegionUpdatePayload = { ...base };
        if (orderValue !== null) payload.displayOrder = orderValue;
        await regionsApi.update(region.regionId, payload);
      } else {
        const payload: RegionCreatePayload = { ...base, displayOrder: orderValue };
        await regionsApi.create(payload);
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

  const numField = (
    label: string,
    value: string,
    setter: (v: string) => void,
  ) => (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label} <span className="text-meta-1">*</span>
      </label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => setter(e.target.value)}
        required
        className={inputCls}
        disabled={submitting}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {isEdit ? "지역 수정" : "지역 등록"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              지역명 <span className="text-meta-1">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              required
              placeholder="예: 강남구"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {numField("위도 최소 (latMin)", latMin, setLatMin)}
            {numField("위도 최대 (latMax)", latMax, setLatMax)}
            {numField("경도 최소 (lngMin)", lngMin, setLngMin)}
            {numField("경도 최대 (lngMax)", lngMax, setLngMax)}
            {numField("중심 위도 (centerLat)", centerLat, setCenterLat)}
            {numField("중심 경도 (centerLng)", centerLng, setCenterLng)}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">정렬 순서</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              min={0}
              placeholder={isEdit ? "" : "비워두면 마지막 순서로 자동 지정"}
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              id="region-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4"
            />
            <label htmlFor="region-active" className="text-sm">
              활성
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
