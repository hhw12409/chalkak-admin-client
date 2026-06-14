"use client";
import React, { useEffect, useState } from "react";
import { termsApi } from "@/lib/api/terms";
import {
  Term,
  TermCreatePayload,
  TermType,
  TermUpdatePayload,
} from "@/types/admin";

interface Props {
  mode: "create" | "edit";
  term?: Term | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_OPTIONS: { value: TermType; label: string }[] = [
  { value: "SERVICE", label: "이용약관" },
  { value: "PRIVACY", label: "개인정보처리방침" },
  { value: "LOCATION", label: "위치기반서비스" },
  { value: "MARKETING", label: "마케팅 수신 동의" },
];

const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/;

// "2026-06-14T12:30" 형태로 datetime-local에 넣을 수 있도록 변환
function toLocalDateTimeInput(iso: string | undefined): string {
  if (!iso) return "";
  const trimmed = iso.length > 16 ? iso.slice(0, 16) : iso;
  return trimmed.replace(" ", "T");
}

// datetime-local 값 → ISO 문자열 (서버 LocalDateTime). 초/밀리초 추가
function fromLocalDateTimeInput(local: string): string {
  if (!local) return local;
  return local.length === 16 ? `${local}:00` : local;
}

export default function TermFormModal({ mode, term, onClose, onSuccess }: Props) {
  const isEdit = mode === "edit";
  const [type, setType] = useState<TermType>(term?.type ?? "SERVICE");
  const [version, setVersion] = useState<string>(term?.version ?? "");
  const [title, setTitle] = useState<string>(term?.title ?? "");
  const [content, setContent] = useState<string>(term?.content ?? "");
  const [effectiveAt, setEffectiveAt] = useState<string>(
    toLocalDateTimeInput(term?.effectiveAt),
  );
  const [isActive, setIsActive] = useState<boolean>(term?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

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

    const trimmedVersion = version.trim();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedVersion) return setErrorMsg("버전을 입력해주세요.");
    if (!VERSION_PATTERN.test(trimmedVersion))
      return setErrorMsg("버전은 'X.Y.Z' 형식이어야 합니다 (예: 1.0.0).");
    if (trimmedVersion.length > 20)
      return setErrorMsg("버전은 20자 이하여야 합니다.");
    if (!trimmedTitle) return setErrorMsg("제목을 입력해주세요.");
    if (trimmedTitle.length > 200)
      return setErrorMsg("제목은 200자 이하여야 합니다.");
    if (!trimmedContent) return setErrorMsg("본문을 입력해주세요.");
    if (!effectiveAt) return setErrorMsg("발효일을 입력해주세요.");

    const payload: TermCreatePayload = {
      type,
      version: trimmedVersion,
      title: trimmedTitle,
      content: trimmedContent,
      effectiveAt: fromLocalDateTimeInput(effectiveAt),
      isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit && term) {
        const update: TermUpdatePayload = payload;
        await termsApi.updateTerm(term.termId, update);
      } else {
        await termsApi.createTerm(payload);
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
          {isEdit ? "약관 수정" : "약관 등록"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">종류 *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TermType)}
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">버전 *</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="예: 1.0.0"
                maxLength={20}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">X.Y.Z 형식</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">발효일 *</label>
              <input
                type="datetime-local"
                value={effectiveAt}
                onChange={(e) => setEffectiveAt(e.target.value)}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                이 시각 이후 사용자에게 자동 노출
              </p>
            </div>
            <div className="flex items-end">
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
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">본문 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm font-mono dark:border-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              평문(whitespace 보존). 마크다운 미지원.
            </p>
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
