"use client";
import React, { useEffect, useState } from "react";
import { bannersApi } from "@/lib/api/banners";
import { Banner, BannerPayload } from "@/types/admin";

const emptyForm = (): BannerPayload => ({
  bannerTypeId: 1,
  bannerUrl: "",
  startedAt: "",
  endedAt: "",
});

export default function BannerListClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; banner?: Banner } | null>(null);
  const [form, setForm] = useState<BannerPayload>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    bannersApi
      .getBanners()
      .then(setBanners)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setModal({ mode: "create" });
  };

  const openEdit = (banner: Banner) => {
    setForm({
      bannerTypeId: banner.bannerTypeId,
      bannerUrl: banner.bannerUrl,
      startedAt: banner.startedAt?.slice(0, 16) ?? "",
      endedAt: banner.endedAt?.slice(0, 16) ?? "",
    });
    setModal({ mode: "edit", banner });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: BannerPayload = {
        ...form,
        startedAt: form.startedAt + ":00",
        endedAt: form.endedAt + ":00",
      };
      if (modal?.mode === "edit" && modal.banner) {
        await bannersApi.updateBanner(modal.banner.bannerId, payload);
      } else {
        await bannersApi.createBanner(payload);
      }
      setModal(null);
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("배너를 삭제하시겠습니까?")) return;
    try {
      await bannersApi.deleteBanner(id);
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">배너 관리</h1>
        <button
          onClick={openCreate}
          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
        >
          + 배너 추가
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : banners.length === 0 ? (
          <div className="py-10 text-center text-gray-400">등록된 배너가 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">타입</th>
                  <th className="px-4 py-3 text-left font-medium">URL</th>
                  <th className="px-4 py-3 text-left font-medium">시작일</th>
                  <th className="px-4 py-3 text-left font-medium">종료일</th>
                  <th className="px-4 py-3 text-left font-medium">노출</th>
                  <th className="px-4 py-3 text-left font-medium">클릭</th>
                  <th className="px-4 py-3 text-left font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.bannerId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{banner.bannerId}</td>
                    <td className="px-4 py-3 text-gray-500">{banner.bannerTypeId}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <a href={banner.bannerUrl} target="_blank" rel="noopener noreferrer"
                        className="truncate block text-primary hover:underline max-w-48">
                        {banner.bannerUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{banner.startedAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-500">{banner.endedAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-500">{banner.impressionCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{banner.clickCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(banner)}
                          className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90">
                          편집
                        </button>
                        <button onClick={() => handleDelete(banner.bannerId)}
                          className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90">
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
              {modal.mode === "create" ? "배너 추가" : "배너 편집"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">배너 타입 ID</label>
                <input
                  type="number"
                  value={form.bannerTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, bannerTypeId: Number(e.target.value) }))}
                  required
                  min={1}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">배너 URL</label>
                <input
                  type="url"
                  value={form.bannerUrl}
                  onChange={(e) => setForm((f) => ({ ...f, bannerUrl: e.target.value }))}
                  required
                  placeholder="https://..."
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">시작일시</label>
                <input
                  type="datetime-local"
                  value={form.startedAt}
                  onChange={(e) => setForm((f) => ({ ...f, startedAt: e.target.value }))}
                  required
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">종료일시</label>
                <input
                  type="datetime-local"
                  value={form.endedAt}
                  onChange={(e) => setForm((f) => ({ ...f, endedAt: e.target.value }))}
                  required
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(null)}
                  className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1">취소</button>
                <button type="submit" disabled={submitting}
                  className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
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
