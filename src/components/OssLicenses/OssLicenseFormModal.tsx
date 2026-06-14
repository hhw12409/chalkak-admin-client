"use client";
import React, { useEffect, useState } from "react";
import { ossLicensesApi } from "@/lib/api/ossLicenses";
import {
  OssLicense,
  OssLicenseCreatePayload,
  OssLicenseUpdatePayload,
} from "@/types/admin";

interface Props {
  mode: "create" | "edit";
  ossLicense?: OssLicense | null;
  onClose: () => void;
  onSuccess: () => void;
}

// 단순 URL 검증 (http/https). 빈 문자열은 허용.
function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function OssLicenseFormModal({
  mode,
  ossLicense,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";
  const [name, setName] = useState(ossLicense?.name ?? "");
  const [version, setVersion] = useState(ossLicense?.version ?? "");
  const [licenseType, setLicenseType] = useState(ossLicense?.licenseType ?? "");
  const [copyright, setCopyright] = useState(ossLicense?.copyright ?? "");
  const [sourceUrl, setSourceUrl] = useState(ossLicense?.sourceUrl ?? "");
  const [licenseText, setLicenseText] = useState(ossLicense?.licenseText ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(
    ossLicense?.displayOrder ?? 0,
  );
  const [isActive, setIsActive] = useState<boolean>(ossLicense?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = name.trim();
    const trimmedType = licenseType.trim();
    const trimmedVersion = version.trim();
    const trimmedCopyright = copyright.trim();
    const trimmedUrl = sourceUrl.trim();
    const trimmedText = licenseText.trim();

    if (!trimmedName) return setErrorMsg("이름을 입력해주세요.");
    if (trimmedName.length > 200)
      return setErrorMsg("이름은 200자 이하여야 합니다.");
    if (trimmedVersion.length > 50)
      return setErrorMsg("버전은 50자 이하여야 합니다.");
    if (!trimmedType) return setErrorMsg("라이선스 타입을 입력해주세요.");
    if (trimmedType.length > 100)
      return setErrorMsg("라이선스 타입은 100자 이하여야 합니다.");
    if (trimmedCopyright.length > 300)
      return setErrorMsg("copyright는 300자 이하여야 합니다.");
    if (trimmedUrl && trimmedUrl.length > 500)
      return setErrorMsg("sourceUrl은 500자 이하여야 합니다.");
    if (trimmedUrl && !isValidUrl(trimmedUrl))
      return setErrorMsg("sourceUrl이 올바른 URL 형식이 아닙니다 (http/https).");
    if (!trimmedText) return setErrorMsg("라이선스 전문을 입력해주세요.");
    if (!Number.isFinite(displayOrder) || displayOrder < 0)
      return setErrorMsg("순서는 0 이상의 숫자여야 합니다.");

    const payload: OssLicenseCreatePayload = {
      name: trimmedName,
      version: trimmedVersion || null,
      licenseType: trimmedType,
      copyright: trimmedCopyright || null,
      sourceUrl: trimmedUrl || null,
      licenseText: trimmedText,
      displayOrder,
      isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit && ossLicense) {
        const update: OssLicenseUpdatePayload = payload;
        await ossLicensesApi.updateOssLicense(ossLicense.ossLicenseId, update);
      } else {
        await ossLicensesApi.createOssLicense(payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-3xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {isEdit ? "OSS 라이선스 수정" : "OSS 라이선스 등록"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">버전</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                maxLength={50}
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                라이선스 타입 *
              </label>
              <input
                type="text"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                placeholder="MIT / Apache-2.0 등"
                maxLength={100}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Copyright</label>
              <input
                type="text"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                maxLength={300}
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                maxLength={500}
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">순서</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                min={0}
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              <span>활성</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              라이선스 전문 *
            </label>
            <textarea
              value={licenseText}
              onChange={(e) => setLicenseText(e.target.value)}
              rows={14}
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm font-mono dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          {errorMsg && <div className="mb-4 text-sm text-meta-1">{errorMsg}</div>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
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
  );
}
