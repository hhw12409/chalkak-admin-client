"use client";
import React, { useState } from "react";
import { getToken, ADMIN_INFO_KEY } from "@/lib/apiClient";

type AdminRole = "ADMIN" | "OPERATOR" | "VIEWER";

interface CsvExportButtonProps {
  exportPath: string; // e.g., "/users/export"
  filterParams?: Record<string, string | number | boolean | undefined | null>;
  requiredRole: AdminRole;
  label?: string;
  fallbackFilename?: string; // 서버 헤더가 없을 때 사용할 기본명
}

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8081/admin";

const ROLE_RANK: Record<AdminRole, number> = {
  ADMIN: 3,
  OPERATOR: 2,
  VIEWER: 1,
};

function readAdminRole(): AdminRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_INFO_KEY);
    if (!raw) return null;
    const info = JSON.parse(raw);
    const role = info?.role;
    if (role === "ADMIN" || role === "OPERATOR" || role === "VIEWER") return role;
    return null;
  } catch {
    return null;
  }
}

function buildQueryString(
  filterParams?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!filterParams) return "";
  const entries = Object.entries(filterParams).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const params = new URLSearchParams();
  entries.forEach(([k, v]) => params.append(k, String(v)));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function toAbsoluteUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(base)) return `${base}${path}`;
  // 상대경로(`/admin`)인 경우 현재 origin과 결합
  if (typeof window !== "undefined") return `${window.location.origin}${base}${path}`;
  return `${base}${path}`;
}

/**
 * Content-Disposition 헤더에서 파일명 추출 (RFC 5987 / RFC 6266).
 * 우선순위: filename*=UTF-8''... > filename="..."
 */
function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  // RFC 5987 — filename*=UTF-8''<percent-encoded>
  const star = contentDisposition.match(/filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i);
  if (star) {
    try {
      return decodeURIComponent(star[2].trim().replace(/^"|"$/g, ""));
    } catch {
      // fallthrough
    }
  }
  // 일반 filename="..."
  const plain = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  if (plain) return plain[1].trim();
  return null;
}

export default function CsvExportButton({
  exportPath,
  filterParams,
  requiredRole,
  label = "CSV 다운로드",
  fallbackFilename = "chalkak_admin_export.csv",
}: CsvExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const role = readAdminRole();

  // 권한 위계: ADMIN > OPERATOR > VIEWER. role >= requiredRole 이어야 노출.
  if (!role || ROLE_RANK[role] < ROLE_RANK[requiredRole]) {
    return null;
  }

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = getToken();
      const url = toAbsoluteUrl(BASE_URL, `${exportPath}${buildQueryString(filterParams)}`);
      const res = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 400) {
        // 10,000행 초과
        let message = "결과가 너무 많습니다. 기간/필터를 좁혀주세요.";
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
        } catch {
          // ignore
        }
        alert(message);
        return;
      }
      if (res.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }
      if (res.status === 403) {
        alert("권한이 없습니다");
        return;
      }
      if (!res.ok) {
        alert("다운로드 실패");
        return;
      }

      const contentType = res.headers.get("Content-Type") ?? "";
      if (!contentType.toLowerCase().includes("text/csv")) {
        // 에러 JSON이 200으로 떨어지는 비정상 케이스 — 메시지 추출 시도
        try {
          const body = await res.json();
          alert(body?.message ?? "CSV 응답이 아닙니다");
        } catch {
          alert("CSV 응답이 아닙니다");
        }
        return;
      }

      const blob = await res.blob();
      const filename =
        extractFilename(res.headers.get("Content-Disposition")) ?? fallbackFilename;

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // 메모리 해제는 비동기 호출 후 다음 tick에
      setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "다운로드 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={loading ? "내려받는 중..." : label}
      className="inline-flex items-center gap-2 rounded bg-meta-3 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-meta-3"
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v11m0 0l-4-4m4 4l4-4M4.5 19.5h15"
          />
        </svg>
      )}
      <span>{loading ? "내려받는 중..." : label}</span>
    </button>
  );
}
