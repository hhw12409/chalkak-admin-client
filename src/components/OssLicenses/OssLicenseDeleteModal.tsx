"use client";
import React, { useState } from "react";
import { ossLicensesApi } from "@/lib/api/ossLicenses";
import { OssLicense } from "@/types/admin";

interface Props {
  ossLicense: OssLicense;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OssLicenseDeleteModal({
  ossLicense,
  onClose,
  onSuccess,
}: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const expected = ossLicense.name;
  const canDelete = confirmText === expected && !submitting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await ossLicensesApi.deleteOssLicense(ossLicense.ossLicenseId);
      if (typeof window !== "undefined") window.alert("삭제되었습니다");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "삭제에 실패했습니다.";
      if (message.includes("찾을 수 없습니다")) {
        if (typeof window !== "undefined") window.alert("이미 삭제된 항목입니다.");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-meta-1">
          OSS 라이선스 삭제
        </h3>

        <div className="mb-4 rounded border border-meta-1/30 bg-red-50 px-3 py-2 text-sm text-meta-1 dark:bg-meta-1/10">
          이 OSS 라이선스 항목을 삭제합니다. 사용자 측 노출이 즉시 중단됩니다.
        </div>

        <div className="mb-4 rounded border border-stroke bg-gray-2 px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4">
          <div>
            <span className="text-gray-500">이름:</span>{" "}
            <span className="font-medium">{ossLicense.name}</span>
          </div>
          {ossLicense.version && (
            <div>
              <span className="text-gray-500">버전:</span> {ossLicense.version}
            </div>
          )}
          <div>
            <span className="text-gray-500">라이선스:</span> {ossLicense.licenseType}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">이중 확인</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`삭제하려면 "${expected}"를 입력하세요`}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
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
            type="button"
            onClick={handleDelete}
            disabled={!canDelete}
            className={`rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              !canDelete ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
