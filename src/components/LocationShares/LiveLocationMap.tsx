"use client";
import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao?: any;
  }
}

interface Props {
  lat: number;
  lng: number;
  label: string;
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const SDK_SRC = (key: string) =>
  `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;

/**
 * 실시간 위치 지도 뷰어.
 * - 좌표 열람(grant) 성공 후에만 마운트되도록 부모(`LiveLocationSection`)에서 dynamic(ssr:false)로 로드.
 * - Kakao Maps JS SDK를 컴포넌트에서 <script> 동적 주입(전역 상주 회피).
 * - 키 미발급/SDK 로드 실패 시 → 좌표 텍스트 + 외부 카카오맵 링크 fallback (프라이버시·기능 모두 만족).
 */
export default function LiveLocationMap({ lat, lng, label }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sdkState, setSdkState] = useState<"loading" | "ready" | "failed">(
    KAKAO_KEY ? "loading" : "failed",
  );

  // SDK 로드 (키 있을 때만)
  useEffect(() => {
    if (!KAKAO_KEY) {
      setSdkState("failed");
      return;
    }

    let cancelled = false;

    const onLoaded = () => {
      if (cancelled) return;
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!cancelled) setSdkState("ready");
        });
      } else {
        setSdkState("failed");
      }
    };

    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      onLoaded();
      return;
    }

    const existing = document.getElementById(
      "kakao-maps-sdk",
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", onLoaded);
      existing.addEventListener("error", () => !cancelled && setSdkState("failed"));
      return () => {
        cancelled = true;
        existing.removeEventListener("load", onLoaded);
      };
    }

    const script = document.createElement("script");
    script.id = "kakao-maps-sdk";
    script.src = SDK_SRC(KAKAO_KEY);
    script.async = true;
    script.addEventListener("load", onLoaded);
    script.addEventListener("error", () => !cancelled && setSdkState("failed"));
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoaded);
    };
  }, []);

  // 지도 렌더
  useEffect(() => {
    if (sdkState !== "ready" || !containerRef.current) return;
    try {
      const { kakao } = window;
      const center = new kakao.maps.LatLng(lat, lng);
      const map = new kakao.maps.Map(containerRef.current, {
        center,
        level: 4,
      });
      const marker = new kakao.maps.Marker({ position: center });
      marker.setMap(map);
      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:4px 8px;font-size:12px;white-space:nowrap;">${label}</div>`,
      });
      infowindow.open(map, marker);
    } catch {
      setSdkState("failed");
    }
  }, [sdkState, lat, lng, label]);

  const externalLink = `https://map.kakao.com/link/map/${encodeURIComponent(
    label,
  )},${lat},${lng}`;

  return (
    <div>
      {sdkState === "failed" ? (
        <div className="rounded border border-stroke bg-gray-1 p-4 text-sm dark:border-strokedark dark:bg-meta-4">
          <p className="mb-2 text-gray-600 dark:text-bodydark">
            지도 SDK를 사용할 수 없어 좌표와 외부 링크로 표시합니다.
          </p>
          <p className="font-mono text-black dark:text-white">
            위도 {lat}, 경도 {lng}
          </p>
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded bg-primary px-3 py-1.5 text-xs text-white hover:bg-opacity-90"
          >
            카카오맵에서 열기 ↗
          </a>
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            className="h-80 w-full rounded border border-stroke dark:border-strokedark"
          />
          {sdkState === "loading" && (
            <p className="mt-1 text-xs text-gray-400">지도 로딩 중...</p>
          )}
        </>
      )}
    </div>
  );
}
