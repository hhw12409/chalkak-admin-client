"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { locationShareApi, LiveLocation } from "@/lib/api/locationShares";
import UnmaskModal from "@/components/common/UnmaskModal";

// 좌표 열람(grant) 성공 후에만 마운트. window/DOM 의존 → ssr:false.
const LiveLocationMap = dynamic(() => import("./LiveLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full animate-pulse rounded border border-stroke bg-gray-1 dark:border-strokedark dark:bg-meta-4" />
  ),
});

interface Props {
  userId: number;
  userNickname: string;
  /** ADMIN만 좌표 열람 가능. false면 섹션 자체 비노출. */
  canViewLocation: boolean;
}

export default function LiveLocationSection({
  userId,
  userNickname,
  canViewLocation,
}: Props) {
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<LiveLocation | null>(null);

  // 좌표 grant는 ADMIN 전용 — 미만 권한이면 섹션 비노출
  if (!canViewLocation) return null;

  const fetchLocation = async () => {
    setLoading(true);
    setError("");
    try {
      const loc = await locationShareApi.getLiveLocation(userId);
      setLocation(loc);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "실시간 위치를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // grant 발급 성공 → 좌표 조회
  const handleGrantSuccess = () => {
    setShowUnmaskModal(false);
    fetchLocation();
  };

  const hasCoords =
    location?.available && location.lat != null && location.lng != null;

  return (
    <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
        <h2 className="font-semibold text-black dark:text-white">실시간 위치 (지도 뷰어)</h2>
        <span className="text-xs text-meta-1">ADMIN 전용 · 좌표 열람 시 감사 로그 기록</span>
      </div>

      <div className="px-6 py-5">
        {location === null ? (
          // 초기 locked 상태 — grant 미발급 / 미조회
          <div className="rounded border border-dashed border-stroke bg-gray-1 p-6 text-center dark:border-strokedark dark:bg-meta-4">
            <p className="mb-1 text-sm text-gray-600 dark:text-bodydark">
              실시간 좌표는 기본적으로 가려져 있습니다.
            </p>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              열람하려면 사유를 입력하고 1시간 한정 열람 권한을 발급받아야 합니다 (감사 로그 자동 기록).
            </p>
            <button
              type="button"
              onClick={() => setShowUnmaskModal(true)}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
            >
              🔓 위치 열람 승인
            </button>
            <p className="mt-3 text-xs text-gray-400">
              ℹ️ 이미 활성 열람 권한이 있다면 사유 입력 없이 바로 조회될 수 있습니다.
            </p>
          </div>
        ) : !location.available ? (
          // grant는 있으나 Redis에 좌표 없음 (한 번도 송신 안 함 / TTL 만료)
          <div className="rounded border border-stroke bg-gray-1 p-6 text-center text-sm text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-bodydark">
            <p>현재 수집된 실시간 위치가 없습니다.</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              사용자가 한 번도 위치를 송신하지 않았거나, 캐시(TTL 30분)가 만료되었습니다.
            </p>
            <button
              type="button"
              onClick={fetchLocation}
              disabled={loading}
              className="mt-3 rounded border border-stroke px-3 py-1.5 text-xs hover:bg-white disabled:opacity-60 dark:border-strokedark dark:hover:bg-boxdark"
            >
              {loading ? "조회 중..." : "다시 조회"}
            </button>
          </div>
        ) : (
          // 좌표 노출 + 지도
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-gray-600 dark:text-bodydark">
                <span className="font-mono text-black dark:text-white">
                  {location.lat}, {location.lng}
                </span>
                {location.capturedAt && (
                  <span className="ml-3 text-xs text-gray-500">
                    수집 시각: {location.capturedAt.replace("T", " ").slice(0, 19)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={fetchLocation}
                disabled={loading}
                className="rounded border border-stroke px-3 py-1.5 text-xs hover:bg-gray-1 disabled:opacity-60 dark:border-strokedark dark:hover:bg-meta-4"
              >
                {loading ? "갱신 중..." : "위치 갱신"}
              </button>
            </div>
            {hasCoords && (
              <LiveLocationMap
                lat={location.lat as number}
                lng={location.lng as number}
                label={userNickname}
              />
            )}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-meta-1">{error}</p>}
      </div>

      {showUnmaskModal && (
        <UnmaskModal
          targetType="USER_LOCATION"
          targetId={userId}
          fieldLabel="실시간 위치 좌표"
          onClose={() => setShowUnmaskModal(false)}
          onSuccess={handleGrantSuccess}
        />
      )}
    </div>
  );
}
