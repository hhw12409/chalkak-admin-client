"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  locationShareApi,
  LocationShareDetail,
  OwnerGrant,
  ViewerGrant,
} from "@/lib/api/locationShares";
import MaskedField from "@/components/common/MaskedField";
import UnmaskModal from "@/components/common/UnmaskModal";
import LocationDisableModal from "@/components/LocationShares/LocationDisableModal";
import GrantDeleteModal from "@/components/LocationShares/GrantDeleteModal";
import LiveLocationSection from "@/components/LocationShares/LiveLocationSection";
import { useAuth } from "@/context/AuthContext";

interface Props {
  userId: number;
}

const statusLabel: Record<string, string> = {
  ACTIVE: "활성",
  DELETED: "탈퇴",
  SUSPENDED: "정지",
};

/** 삭제하려는 grant 정보 (모달 입력) */
interface PendingGrantDelete {
  grantId: number;
  side: "owner" | "viewer";
  counterpartNickname: string;
}

const StateBadge = ({ state }: { state: string }) => (
  <span
    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
      state === "SHARING"
        ? "bg-meta-3/10 text-meta-3"
        : "bg-meta-6/10 text-meta-6"
    }`}
  >
    {state === "SHARING" ? "공유 중" : state === "GHOST" ? "고스트" : state}
  </span>
);

const MutualBadge = ({ mutual }: { mutual: boolean }) =>
  mutual ? (
    <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      맞팔
    </span>
  ) : (
    <span className="text-xs text-gray-400">단방향</span>
  );

export default function LocationShareDetailClient({ userId }: Props) {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [detail, setDetail] = useState<LocationShareDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [unmaskField, setUnmaskField] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [pendingGrantDelete, setPendingGrantDelete] =
    useState<PendingGrantDelete | null>(null);

  const load = () => {
    setLoading(true);
    setError("");
    locationShareApi
      .getDetail(userId)
      .then(setDetail)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "상세 정보를 불러올 수 없습니다."),
      )
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [userId]);

  if (loading) return <div className="py-10 text-center text-gray-400">불러오는 중...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!detail) return null;

  const openUnmask = (field: string) => {
    setUnmaskField(field);
    setShowUnmaskModal(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">위치공유 상세</h1>
        <Link href="/location-shares" className="text-sm text-primary hover:underline">
          ← 목록으로
        </Link>
      </div>

      {/* 프로필 / 설정 카드 */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-5 flex items-center gap-4">
          <div>
            <p className="text-lg font-semibold text-black dark:text-white">{detail.nickname}</p>
            <p className="text-sm text-gray-500">ID {detail.userId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <span className="text-xs text-gray-500">이메일</span>
            <p className="font-medium text-black dark:text-white">
              <MaskedField
                value={detail.email}
                masked={detail.emailMasked}
                onReveal={() => openUnmask("이메일")}
              />
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">전화번호</span>
            <p className="font-medium text-black dark:text-white">
              <MaskedField
                value={detail.phoneNumber}
                masked={detail.phoneNumberMasked}
                onReveal={() => openUnmask("전화번호")}
              />
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">회원 상태</span>
            <p className="font-medium text-black dark:text-white">
              {statusLabel[detail.status] ?? detail.status}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">전역 위치공유</span>
            <p className="mt-0.5">
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                detail.globalEnabled ? "bg-meta-3/10 text-meta-3" : "bg-gray-100 text-gray-500 dark:bg-meta-4 dark:text-gray-400"
              }`}>
                {detail.globalEnabled ? "ON" : "OFF"}
              </span>
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">설정 갱신 시각</span>
            <p className="font-medium text-black dark:text-white">
              {detail.settingUpdatedAt
                ? detail.settingUpdatedAt.replace("T", " ").slice(0, 16)
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* 위험 구역 — ADMIN 전용 전역 강제 OFF */}
      {isAdmin && (
        <div className="mb-6 rounded-sm border-2 border-meta-1 bg-red-50 shadow-default dark:bg-red-900/10">
          <div className="flex items-center justify-between border-b border-meta-1/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">⚠️</span>
              <h2 className="font-semibold text-meta-1">위험 작업 (Danger Zone)</h2>
            </div>
            <span className="text-xs text-meta-1">신중하게 사용하세요.</span>
          </div>
          <div className="flex flex-col items-start justify-between gap-3 px-6 py-5 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="font-medium text-black dark:text-white">전역 위치공유 강제 OFF</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-bodydark">
                이 사용자의 전역 공유 설정을 끄고 실시간 좌표 캐시를 제거합니다. 도용·신고 즉시 차단 수단.
                {!detail.globalEnabled && (
                  <span className="ml-1 text-meta-6">(이미 OFF 상태 — 멱등 실행 가능)</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDisableModal(true)}
              className="shrink-0 rounded bg-meta-1 px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
            >
              강제 OFF
            </button>
          </div>
        </div>
      )}

      {/* 실시간 위치 — ADMIN 전용 */}
      <LiveLocationSection
        userId={userId}
        userNickname={detail.nickname}
        canViewLocation={isAdmin}
      />

      {/* grantsAsOwner — 이 유저 위치를 보는 사람들 */}
      <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h2 className="font-semibold text-black dark:text-white">
            내 위치를 보는 사람들
            <span className="ml-2 text-sm font-normal text-gray-500">
              (owner grant · 총 {detail.grantsAsOwner.length}건)
            </span>
          </h2>
        </div>
        <GrantTable
          rows={detail.grantsAsOwner}
          side="owner"
          isAdmin={isAdmin}
          onDelete={(g) =>
            setPendingGrantDelete({
              grantId: g.grantId,
              side: "owner",
              counterpartNickname: (g as OwnerGrant).viewerNickname,
            })
          }
        />
      </div>

      {/* grantsAsViewer — 이 유저가 보는 사람들 */}
      <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h2 className="font-semibold text-black dark:text-white">
            이 사용자가 보는 사람들
            <span className="ml-2 text-sm font-normal text-gray-500">
              (viewer grant · 총 {detail.grantsAsViewer.length}건)
            </span>
          </h2>
        </div>
        <GrantTable
          rows={detail.grantsAsViewer}
          side="viewer"
          isAdmin={isAdmin}
          onDelete={(g) =>
            setPendingGrantDelete({
              grantId: g.grantId,
              side: "viewer",
              counterpartNickname: (g as ViewerGrant).ownerNickname,
            })
          }
        />
      </div>

      {/* 감사/개입 이력 링크 (§0.5 — 별도 페이지 없이 audit-logs로 라우팅) */}
      <div className="mt-6 text-sm">
        <Link
          href={`/audit-logs?targetType=USER&keyword=${userId}`}
          className="text-primary hover:underline"
        >
          → 이 사용자 관련 어드민 개입 이력 (감사 로그)
        </Link>
      </div>

      {showUnmaskModal && (
        <UnmaskModal
          targetType="USER"
          targetId={userId}
          fieldLabel={unmaskField}
          onClose={() => setShowUnmaskModal(false)}
          onSuccess={() => {
            setShowUnmaskModal(false);
            load();
          }}
        />
      )}

      {showDisableModal && (
        <LocationDisableModal
          userId={userId}
          userNickname={detail.nickname}
          onClose={() => setShowDisableModal(false)}
          onSuccess={(updated) => setDetail(updated)}
        />
      )}

      {pendingGrantDelete && (
        <GrantDeleteModal
          userId={userId}
          grantId={pendingGrantDelete.grantId}
          side={pendingGrantDelete.side}
          counterpartNickname={pendingGrantDelete.counterpartNickname}
          onClose={() => setPendingGrantDelete(null)}
          onSuccess={() => {
            setPendingGrantDelete(null);
            load();
          }}
        />
      )}
    </div>
  );
}

interface GrantTableProps {
  rows: (OwnerGrant | ViewerGrant)[];
  side: "owner" | "viewer";
  isAdmin: boolean;
  onDelete: (grant: OwnerGrant | ViewerGrant) => void;
}

function GrantTable({ rows, side, isAdmin, onDelete }: GrantTableProps) {
  const counterpartLabel = side === "owner" ? "viewer (보는 사람)" : "owner (대상)";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
            <th className="px-4 py-3 text-left font-medium">grantId</th>
            <th className="px-4 py-3 text-left font-medium">{counterpartLabel}</th>
            <th className="px-4 py-3 text-left font-medium">상태</th>
            <th className="px-4 py-3 text-left font-medium">맞팔</th>
            <th className="px-4 py-3 text-left font-medium">생성일</th>
            <th className="px-4 py-3 text-left font-medium">갱신일</th>
            {isAdmin && <th className="px-4 py-3 text-left font-medium">액션</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-400">
                공유 관계가 없습니다
              </td>
            </tr>
          ) : (
            rows.map((g) => {
              const counterpartId =
                side === "owner"
                  ? (g as OwnerGrant).viewerUserId
                  : (g as ViewerGrant).ownerUserId;
              const counterpartName =
                side === "owner"
                  ? (g as OwnerGrant).viewerNickname
                  : (g as ViewerGrant).ownerNickname;
              return (
                <tr key={g.grantId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                  <td className="px-4 py-3 text-gray-500">{g.grantId}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/location-shares/${counterpartId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {counterpartName}
                    </Link>
                    <span className="ml-1 text-xs text-gray-400">#{counterpartId}</span>
                  </td>
                  <td className="px-4 py-3"><StateBadge state={g.state} /></td>
                  <td className="px-4 py-3"><MutualBadge mutual={g.mutualFollow} /></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {g.createdAt ? g.createdAt.replace("T", " ").slice(0, 16) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {g.updatedAt ? g.updatedAt.replace("T", " ").slice(0, 16) : "-"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDelete(g)}
                        className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                      >
                        강제삭제
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
