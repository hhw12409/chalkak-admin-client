"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ForceLogoutModal from "./ForceLogoutModal";
import ForceWithdrawalModal from "./ForceWithdrawalModal";

interface Props {
  userId: number;
  userNickname: string;
  /** 'ACTIVE' | 'DELETED' | 'SUSPENDED' 등. ACTIVE가 아니면 두 버튼 모두 비활성. */
  userStatus: string;
  onSuccess: () => void;
}

export default function UserDangerZone({
  userId,
  userNickname,
  userStatus,
  onSuccess,
}: Props) {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  // ADMIN이 아니면 카드 자체 비노출
  if (!isAdmin) return null;

  const isActive = userStatus === "ACTIVE";
  // 강제 로그아웃: 모든 상태에서 활성 (멱등 허용 — DELETED/SUSPENDED 회원도 토큰 정리 가능)
  const logoutDisabled = false;
  // 강제 탈퇴: ACTIVE만 허용 (비가역 작업)
  const withdrawalDisabled = !isActive;
  const withdrawalDisabledMessage = withdrawalDisabled
    ? userStatus === "DELETED"
      ? "이미 탈퇴 처리된 회원입니다."
      : `회원 상태가 ${userStatus}이므로 강제 탈퇴를 실행할 수 없습니다.`
    : "";

  return (
    <div className="mt-6 rounded-sm border-2 border-meta-1 bg-red-50 shadow-default dark:bg-red-900/10">
      <div className="flex items-center justify-between border-b border-meta-1/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            ⚠️
          </span>
          <h2 className="font-semibold text-meta-1">위험 작업 (Danger Zone)</h2>
        </div>
        <span className="text-xs text-meta-1">
          이 작업은 매우 강력합니다. 신중하게 사용하세요.
        </span>
      </div>

      <div className="space-y-4 px-6 py-5">
        {/* 강제 로그아웃 — 모든 상태에서 활성 (멱등) */}
        <div className="flex flex-col items-start justify-between gap-3 rounded border border-meta-6/30 bg-white p-4 md:flex-row md:items-center dark:bg-boxdark">
          <div className="flex-1">
            <p className="font-medium text-black dark:text-white">강제 로그아웃</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-bodydark">
              모든 디바이스에서 즉시 로그아웃 처리. 계정은 살아있고 본인은 다시 로그인할 수 있습니다.
              {!isActive && (
                <span className="ml-1 text-meta-6">
                  ({userStatus} 회원에 대해서도 토큰 정리 목적으로 실행 가능합니다.)
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            disabled={logoutDisabled}
            className={`shrink-0 rounded bg-meta-6 px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              logoutDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            강제 로그아웃
          </button>
        </div>

        {/* 강제 탈퇴 — ACTIVE만 허용 */}
        <div className="flex flex-col items-start justify-between gap-3 rounded border border-meta-1/30 bg-white p-4 md:flex-row md:items-center dark:bg-boxdark">
          <div className="flex-1">
            <p className="font-medium text-black dark:text-white">강제 탈퇴</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-bodydark">
              계정을 영구 차단하고 개인정보를 익명화합니다. <span className="font-semibold text-meta-1">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            {withdrawalDisabled && (
              <p className="mt-1 text-xs text-meta-1">{withdrawalDisabledMessage}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowWithdrawalModal(true)}
            disabled={withdrawalDisabled}
            className={`shrink-0 rounded bg-meta-1 px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 ${
              withdrawalDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            강제 탈퇴
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <ForceLogoutModal
          userId={userId}
          userNickname={userNickname}
          onClose={() => setShowLogoutModal(false)}
          onSuccess={onSuccess}
        />
      )}

      {showWithdrawalModal && (
        <ForceWithdrawalModal
          userId={userId}
          userNickname={userNickname}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
