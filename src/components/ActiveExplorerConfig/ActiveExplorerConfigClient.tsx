"use client";
import React, { useEffect, useState } from "react";
import { activeExplorerApi } from "@/lib/api/activeExplorer";
import {
  ActiveExplorerConfig,
  ActiveExplorerConfigUpdatePayload,
} from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

/**
 * "지금 활발한 탐험가" 집계 기준 관리 화면.
 * - 5개 지표 가중치 + 집계 기간(windowDays) + 노출 인원수(resultSize) 폼.
 * - ADMIN 만 저장 가능. OPERATOR/VIEWER 는 읽기 전용.
 * - 검증: 가중치 @Min(0), windowDays 1~365, resultSize 1~100 (서버와 동일).
 */

interface WeightField {
  key: "weightPost" | "weightVisit" | "weightCheckin" | "weightLike" | "weightComment";
  label: string;
  desc: string;
}

const WEIGHT_FIELDS: WeightField[] = [
  { key: "weightPost", label: "글 작성", desc: "집계 기간 내 작성한 게시글 수에 곱해지는 가중치" },
  { key: "weightVisit", label: "스팟 방문", desc: "VISITED 처리한 스팟 방문 수에 곱해지는 가중치" },
  { key: "weightCheckin", label: "체크인", desc: "현장 체크인(혼잡도 제보) 수에 곱해지는 가중치" },
  { key: "weightLike", label: "받은 좋아요", desc: "작성한 글이 받은 좋아요 수에 곱해지는 가중치" },
  { key: "weightComment", label: "댓글", desc: "작성한 댓글 수에 곱해지는 가중치" },
];

type FormState = ActiveExplorerConfigUpdatePayload;

export default function ActiveExplorerConfigClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [config, setConfig] = useState<ActiveExplorerConfig | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    activeExplorerApi
      .get()
      .then((data) => {
        setConfig(data);
        setForm({
          weightPost: data.weightPost,
          weightVisit: data.weightVisit,
          weightCheckin: data.weightCheckin,
          weightLike: data.weightLike,
          weightComment: data.weightComment,
          windowDays: data.windowDays,
          resultSize: data.resultSize,
        });
        setError("");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "집계 기준을 불러올 수 없습니다.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key: keyof FormState, value: number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSuccess("");
  };

  const validate = (f: FormState): string | null => {
    for (const wf of WEIGHT_FIELDS) {
      const v = f[wf.key];
      if (!Number.isInteger(v) || v < 0) return `${wf.label} 가중치는 0 이상의 정수여야 합니다.`;
    }
    if (!Number.isInteger(f.windowDays) || f.windowDays < 1 || f.windowDays > 365)
      return "집계 기간은 1~365일 사이여야 합니다.";
    if (!Number.isInteger(f.resultSize) || f.resultSize < 1 || f.resultSize > 100)
      return "노출 인원수는 1~100명 사이여야 합니다.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !isAdmin) return;
    const msg = validate(form);
    if (msg) {
      setError(msg);
      setSuccess("");
      return;
    }
    setSaving(true);
    activeExplorerApi
      .update(form)
      .then((data) => {
        setConfig(data);
        setForm({
          weightPost: data.weightPost,
          weightVisit: data.weightVisit,
          weightCheckin: data.weightCheckin,
          weightLike: data.weightLike,
          weightComment: data.weightComment,
          windowDays: data.windowDays,
          resultSize: data.resultSize,
        });
        setError("");
        setSuccess("집계 기준을 저장했습니다.");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.")
      )
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          활발한 탐험가 집계 기준
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          앱 &quot;지금 활발한 탐험가&quot; 랭킹의 가중치와 집계 기간을 관리합니다. 글
          작성·스팟 방문·체크인·받은 좋아요·댓글 5개 지표에 가중치를 부여해 종합 점수로
          랭킹합니다.
        </p>
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}
      {success && <div className="mb-4 text-sm text-meta-3">{success}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading || !form ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6.5">
            <div className="mb-6 rounded border border-stroke bg-gray-2 px-4 py-3 text-sm text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300">
              가중치 <span className="font-semibold">0 = 해당 지표 제외</span>. 가중치가
              클수록 해당 지표가 종합 점수에 더 크게 반영됩니다.
            </div>

            <h2 className="mb-4 text-base font-semibold text-black dark:text-white">
              지표 가중치
            </h2>
            <div className="mb-8 flex flex-col gap-5">
              {WEIGHT_FIELDS.map((wf) => (
                <div
                  key={wf.key}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="sm:max-w-md">
                    <label className="block font-medium text-black dark:text-white">
                      {wf.label}
                    </label>
                    <p className="mt-0.5 text-xs text-gray-500">{wf.desc}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    disabled={!isAdmin}
                    value={form[wf.key]}
                    onChange={(e) => setField(wf.key, Number(e.target.value))}
                    className="w-full rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-2 disabled:text-gray-500 dark:border-strokedark dark:bg-boxdark dark:text-white dark:disabled:bg-meta-4 sm:w-32"
                  />
                </div>
              ))}
            </div>

            <h2 className="mb-4 text-base font-semibold text-black dark:text-white">
              집계 설정
            </h2>
            <div className="mb-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="sm:max-w-md">
                  <label className="block font-medium text-black dark:text-white">
                    집계 기간 (일)
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    최근 N일 동안의 활동을 집계 대상으로 삼습니다. (1~365)
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={365}
                  step={1}
                  disabled={!isAdmin}
                  value={form.windowDays}
                  onChange={(e) => setField("windowDays", Number(e.target.value))}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-2 disabled:text-gray-500 dark:border-strokedark dark:bg-boxdark dark:text-white dark:disabled:bg-meta-4 sm:w-32"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="sm:max-w-md">
                  <label className="block font-medium text-black dark:text-white">
                    노출 인원수 (명)
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    랭킹에 기본 노출할 상위 인원수입니다. (1~100)
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  disabled={!isAdmin}
                  value={form.resultSize}
                  onChange={(e) => setField("resultSize", Number(e.target.value))}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-2 disabled:text-gray-500 dark:border-strokedark dark:bg-boxdark dark:text-white dark:disabled:bg-meta-4 sm:w-32"
                />
              </div>
            </div>

            {config?.updatedAt && (
              <p className="mb-4 text-xs text-gray-500">
                마지막 수정: {config.updatedAt.replace("T", " ").slice(0, 19)}
              </p>
            )}

            {isAdmin ? (
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            ) : (
              <p className="text-xs text-gray-500">
                집계 기준의 수정은 ADMIN 권한만 가능합니다. (현재 권한: {admin?.role})
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
