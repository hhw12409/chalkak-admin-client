"use client";
import React, { useEffect, useState } from "react";
import { popularRegionsApi } from "@/lib/api/popularRegions";
import {
  PopularRegion,
  PopularRegionCreatePayload,
} from "@/types/admin";

type FormState = {
  name: string;
  latitude: string;
  longitude: string;
  zoomLevel: string;
  displayOrder: string;
  isActive: boolean;
};

const emptyForm = (defaultOrder: number): FormState => ({
  name: "",
  latitude: "",
  longitude: "",
  zoomLevel: "5",
  displayOrder: String(defaultOrder),
  isActive: true,
});

function parseForm(form: FormState): PopularRegionCreatePayload | string {
  const name = form.name.trim();
  if (!name) return "지역명을 입력해주세요.";
  if (name.length > 30) return "지역명은 30자 이내여야 합니다.";

  const lat = Number(form.latitude);
  const lng = Number(form.longitude);
  const zoom = Number(form.zoomLevel);
  const order = Number(form.displayOrder);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return "위도는 -90 ~ 90 사이여야 합니다.";
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return "경도는 -180 ~ 180 사이여야 합니다.";
  if (!Number.isInteger(zoom) || zoom < 1 || zoom > 14) return "줌 레벨은 1 ~ 14 사이의 정수여야 합니다.";
  if (!Number.isInteger(order) || order < 0) return "정렬 순서는 0 이상의 정수여야 합니다.";

  return {
    name,
    latitude: lat,
    longitude: lng,
    zoomLevel: zoom,
    displayOrder: order,
    isActive: form.isActive,
  };
}

export default function PopularRegionListClient() {
  const [items, setItems] = useState<PopularRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; region?: PopularRegion } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(0));
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState(false);

  const load = () => {
    setLoading(true);
    popularRegionsApi
      .list()
      .then((rows) => {
        // displayOrder ASC 보장
        const sorted = [...rows].sort((a, b) => a.displayOrder - b.displayOrder);
        setItems(sorted);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "조회 실패"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm(items.length));
    setModal({ mode: "create" });
  };

  const openEdit = (region: PopularRegion) => {
    setForm({
      name: region.name,
      latitude: String(region.latitude),
      longitude: String(region.longitude),
      zoomLevel: String(region.zoomLevel),
      displayOrder: String(region.displayOrder),
      isActive: region.isActive,
    });
    setModal({ mode: "edit", region });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseForm(form);
    if (typeof parsed === "string") {
      alert(parsed);
      return;
    }
    setSubmitting(true);
    try {
      if (modal?.mode === "edit" && modal.region) {
        await popularRegionsApi.update(modal.region.id, parsed);
      } else {
        await popularRegionsApi.create(parsed);
      }
      setModal(null);
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (region: PopularRegion) => {
    if (!confirm(`인기 지역 "${region.name}"을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      await popularRegionsApi.remove(region.id);
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  const handleToggleActive = async (region: PopularRegion) => {
    try {
      await popularRegionsApi.update(region.id, { isActive: !region.isActive });
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "상태 변경 실패");
    }
  };

  const move = async (region: PopularRegion, direction: -1 | 1) => {
    const idx = items.findIndex((r) => r.id === region.id);
    const swap = idx + direction;
    if (idx < 0 || swap < 0 || swap >= items.length) return;
    const next = [...items];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setReordering(true);
    try {
      await popularRegionsApi.reorder(next.map((r) => r.id));
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "순서 변경 실패");
    } finally {
      setReordering(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">인기 지역 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            지도 페이지 상단 Quick Jump 칩으로 노출됩니다. 비활성 항목은 사용자에게 보이지 않습니다.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
        >
          + 인기 지역 추가
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-gray-400">등록된 인기 지역이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-4 py-3 text-left font-medium">순서</th>
                  <th className="px-4 py-3 text-left font-medium">지역명</th>
                  <th className="px-4 py-3 text-left font-medium">좌표</th>
                  <th className="px-4 py-3 text-left font-medium">줌</th>
                  <th className="px-4 py-3 text-left font-medium">상태</th>
                  <th className="px-4 py-3 text-left font-medium">정렬</th>
                  <th className="px-4 py-3 text-left font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {items.map((region, idx) => (
                  <tr key={region.id} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{region.displayOrder}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{region.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{region.zoomLevel}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(region)}
                        className={`rounded px-2 py-1 text-xs ${
                          region.isActive ? "bg-meta-3 text-white" : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {region.isActive ? "활성" : "비활성"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0 || reordering}
                          onClick={() => move(region, -1)}
                          className="rounded border border-stroke px-2 py-1 text-xs disabled:opacity-40"
                          aria-label="위로"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1 || reordering}
                          onClick={() => move(region, 1)}
                          className="rounded border border-stroke px-2 py-1 text-xs disabled:opacity-40"
                          aria-label="아래로"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(region)}
                          className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleDelete(region)}
                          className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              {modal.mode === "create" ? "인기 지역 추가" : "인기 지역 편집"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">지역명 (최대 30자)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  maxLength={30}
                  placeholder="예: 강남"
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">위도 (latitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.latitude}
                    onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                    required
                    placeholder="37.4979"
                    className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">경도 (longitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.longitude}
                    onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                    required
                    placeholder="127.0276"
                    className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">줌 레벨 (1~14)</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={form.zoomLevel}
                    onChange={(e) => setForm((f) => ({ ...f, zoomLevel: e.target.value }))}
                    required
                    className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">정렬 순서 (0~)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.displayOrder}
                    onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                    required
                    className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  id="popular-region-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <label htmlFor="popular-region-active" className="text-sm">
                  활성 (체크 해제 시 사용자에게 노출되지 않음)
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1"
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
      )}
    </div>
  );
}
