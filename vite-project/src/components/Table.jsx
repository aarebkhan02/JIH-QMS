import React from 'react';
import { Search } from 'lucide-react';

export function TableScroll({ children }) {
  return <div className="table-scroll">{children}</div>;
}

export function Th({ children }) {
  return (
    <th className="whitespace-nowrap pb-3 pr-5 text-[10px] font-bold uppercase tracking-[.13em] text-[#8a948e]">
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`whitespace-nowrap py-4 pr-5 text-[#66766d] ${className}`}>{children}</td>
  );
}

export function IconButton({ icon: Icon, onClick, label }) {
  const testId = `button-${label.toLowerCase().replaceAll(' ', '-')}`;
  return (
    <button
      data-testid={testId}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-lg p-2 text-[#597267] hover:bg-[#e7f0e9] hover:text-[#246b59]"
    >
      <Icon size={16} />
    </button>
  );
}

export function EmptyState({ title, description, onAction, actionLabel }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d9cfbc] bg-[#fcfaf4] px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f4e6c7] text-[#9b6b1e]">
        <Search size={21} />
      </div>
      <h4 className="mt-4 font-display text-lg font-extrabold text-[#315246]">{title}</h4>
      <p className="mt-1 text-sm text-[#7b867e]">{description}</p>
      {onAction && (
        <button onClick={onAction} className="btn-secondary mt-5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
