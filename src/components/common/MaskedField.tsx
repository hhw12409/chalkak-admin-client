"use client";
import React from "react";

interface MaskedFieldProps {
  value: string;
  masked: boolean;
  onReveal?: () => void;
  className?: string;
}

export default function MaskedField({ value, masked, onReveal, className }: MaskedFieldProps) {
  if (!masked) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <span>{value}</span>
      {onReveal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReveal();
          }}
          className="inline-flex items-center justify-center text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary"
          title="개인정보 열람"
          aria-label="개인정보 열람"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
