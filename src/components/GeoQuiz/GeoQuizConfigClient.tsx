"use client";
import React, { useEffect, useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizConfig, GeoQuizConfigUpdatePayload } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

/**
 * "포토 어디게" 게임 설정 화면.
 * - 4개 필드(보상 포인트 / 점수 감쇠상수 / 문항 최대점수 / 데일리 문항수) 폼.
 * - ADMIN 만 저장 가능. OPERATOR/VIEWER 는 읽기 전용.
 * - 검증: rewardPoint≥0, decayKm>0, maxScore≥1, dailyQuestionCount 1~20 (서버와 동일).
 */

type FieldKey = "rewardPoint" | "decayKm" | "maxScore" | "dailyQuestionCount";

interface FieldDef {
  key: FieldKey;
  label: string;
  desc: string;
  min: number;
  max?: number;
  step: number;
  integer: boolean;
}

const FIELDS: FieldDef[] = [
  {
    key: "rewardPoint",
    label: "데일리 완료 보상 (P)",
    desc: "데일리 5문제를 완료한 유저에게 지급되는 포인트입니다. (0 이상)",
    min: 0,
    step: 1,
    integer: true,
  },
  {
    key: "decayKm",
    label: "점수 감쇠 상수 (km)",
    desc: "점수 = round(최대점수 × exp(-거리km / 감쇠상수)). 값이 작을수록 거리 오차에 점수가 가파르게 떨어집니다. (0 초과)",
    min: 0,
    step: 0.1,
    integer: false,
  },
  {
    key: "maxScore",
    label: "문항 최대 점수",
    desc: "정답 좌표에 가장 가까울 때(0m) 받는 문항당 최대 점수입니다. (1 이상)",
    min: 1,
    step: 1,
    integer: true,
  },
  {
    key: "dailyQuestionCount",
    label: "데일리 문항 수",
    desc: "하루에 출제되는 데일리 문제 수입니다. (1~20)",
    min: 1,
    max: 20,
    step: 1,
    integer: true,
  },
];

type FormState = Required<GeoQuizConfigUpdatePayload>;

function toForm(c: GeoQuizConfig): FormState {
  return {
    rewardPoint: c.rewardPoint,
    decayKm: c.decayKm,
    maxScore: c.maxScore,
    dailyQuestionCount: c.dailyQuestionCount,
  };
}

export default function GeoQuizConfigClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [config, setConfig] = useState<GeoQuizConfig | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    geoQuizApi
      .getConfig()
      .then((data) => {
        setConfig(data);
        setForm(toForm(data));
        setError("");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "게임 설정을 불러올 수 없습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key: FieldKey, value: number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSuccess("");
  };

  const validate = (f: FormState): string | null => {
    if (!Number.isInteger(f.rewardPoint) || f.rewardPoint < 0)
      return "보상 포인트는 0 이상의 정수여야 합니다.";
    if (!Number.isFinite(f.decayKm) || f.decayKm <= 0)
      return "점수 감쇠 상수는 0보다 커야 합니다.";
    if (!Number.isInteger(f.maxScore) || f.maxScore < 1)
      return "문항 최대 점수는 1 이상의 정수여야 합니다.";
    if (
      !Number.isInteger(f.dailyQuestionCount) ||
      f.dailyQuestionCount < 1 ||
      f.dailyQuestionCount > 20
    )
      return "데일리 문항 수는 1~20 사이여야 합니다.";
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
    geoQuizApi
      .updateConfig(form)
      .then((data) => {
        setConfig(data);
        setForm(toForm(data));
        setError("");
        setSuccess("게임 설정을 저장했습니다. (런타임 즉시 반영)");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "저장에 실패했습니다."),
      )
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          포토 어디게 게임 설정
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          데일리 5문제 GeoGuessr 게임의 보상 포인트·점수 공식·문항 수를 관리합니다. 저장
          즉시 chalkak-server 채점/보상에 반영됩니다.
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
              점수 공식: <span className="font-semibold">round(최대점수 × exp(-거리km / 감쇠상수))</span>. 설정 행이
              아직 생성되지 않은 경우 게임은 기본값(50 / 1.5 / 5000 / 5)으로 동작합니다.
            </div>

            <div className="mb-8 flex flex-col gap-5">
              {FIELDS.map((fd) => (
                <div
                  key={fd.key}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="sm:max-w-md">
                    <label className="block font-medium text-black dark:text-white">
                      {fd.label}
                    </label>
                    <p className="mt-0.5 text-xs text-gray-500">{fd.desc}</p>
                  </div>
                  <input
                    type="number"
                    min={fd.min}
                    max={fd.max}
                    step={fd.step}
                    disabled={!isAdmin}
                    value={form[fd.key]}
                    onChange={(e) =>
                      setField(
                        fd.key,
                        fd.integer ? parseInt(e.target.value || "0", 10) : Number(e.target.value),
                      )
                    }
                    className="w-full rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-2 disabled:text-gray-500 dark:border-strokedark dark:bg-boxdark dark:text-white dark:disabled:bg-meta-4 sm:w-40"
                  />
                </div>
              ))}
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
                게임 설정의 수정은 ADMIN 권한만 가능합니다. (현재 권한: {admin?.role})
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
