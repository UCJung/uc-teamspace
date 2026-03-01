import React from 'react';

interface SummaryCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subText?: string;
  className?: string;
}

export default function SummaryCard({ icon, label, value, subText, className = '' }: SummaryCardProps) {
  return (
    <div
      className={[
        'bg-white rounded-lg border border-[var(--gray-border)] px-5 py-4 flex items-center gap-4',
        className,
      ].join(' ')}
    >
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--primary-bg)] flex items-center justify-center text-[var(--primary)] text-[18px]">
          {icon}
        </div>
      )}
      <div>
        <p className="text-[11px] text-[var(--text-sub)]">{label}</p>
        <p className="text-[20px] font-bold text-[var(--text)] leading-tight">{value}</p>
        {subText && <p className="text-[11px] text-[var(--text-sub)] mt-0.5">{subText}</p>}
      </div>
    </div>
  );
}
