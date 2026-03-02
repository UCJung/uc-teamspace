import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';

interface ExpandedEditorProps {
  value: string;
  title: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export default function ExpandedEditor({ value, title, onSave, onClose }: ExpandedEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'F2') {
      onSave(localValue);
      onClose();
    }
  };

  return (
    <div
      className="mt-3 overflow-hidden"
      style={{
        backgroundColor: 'var(--primary-bg)',
        borderTop: '2px solid var(--primary)',
        borderLeft: '1px solid var(--gray-border)',
        borderRight: '1px solid var(--gray-border)',
        borderBottom: '1px solid var(--gray-border)',
        borderRadius: '0 0 8px 8px',
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--gray-border)', backgroundColor: 'white' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px]">📝</span>
          <span className="text-[12px] font-semibold text-[var(--primary)]">
            셀 확대 편집
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
            }}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--text-sub)]">F2 저장 · ESC 닫기</span>
          <Button
            variant="ghost"
            size="small"
            onClick={onClose}
            className="text-[var(--text-sub)] hover:text-[var(--danger)]"
          >
            ✕ 닫기
          </Button>
        </div>
      </div>

      {/* 편집 영역 */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={8}
          className="w-full px-3 py-2 text-[13px] text-[var(--text)] outline-none resize-y border border-[var(--gray-border)] rounded focus:border-[var(--primary)]"
          placeholder={'[업무항목]\n*세부업무\nㄴ상세작업'}
          style={{
            lineHeight: '1.6',
            backgroundColor: 'white',
            fontFamily: 'inherit',
          }}
        />
        <p className="text-[10px] text-[var(--text-sub)] mt-1.5 flex items-center gap-1">
          <span className="font-mono bg-[var(--gray-light)] rounded px-1">[항목]</span>
          업무항목
          <span className="mx-1 text-[var(--gray-border)]">·</span>
          <span className="font-mono bg-[var(--gray-light)] rounded px-1">*세부</span>
          세부업무
          <span className="mx-1 text-[var(--gray-border)]">·</span>
          <span className="font-mono bg-[var(--gray-light)] rounded px-1">ㄴ상세</span>
          상세작업
        </p>
      </div>

      {/* 푸터 */}
      <div
        className="flex justify-end gap-2 px-4 py-2.5"
        style={{ borderTop: '1px solid var(--gray-border)', backgroundColor: 'white' }}
      >
        <Button variant="ghost" size="small" onClick={onClose}>취소</Button>
        <Button size="small" onClick={() => { onSave(localValue); onClose(); }}>저장 (F2)</Button>
      </div>
    </div>
  );
}
