import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, description, onClose, children }) {
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="card-surface my-auto w-full max-w-xl rounded-2xl bg-[#fffdf8] p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-.04em] text-[#183f35]">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-[#7b867e]">{description}</p>}
          </div>
          <button
            aria-label="Close dialog"
            data-testid="button-close-modal"
            onClick={onClose}
            className="rounded-lg p-2 text-[#78847c] hover:bg-[#f1ece1]"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ onClose, onSubmit, submitLabel, cancel = true }) {
  return (
    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      {cancel && (
        <button
          type="button"
          data-testid="button-modal-cancel"
          onClick={onClose}
          className="btn-secondary justify-center"
        >
          Cancel
        </button>
      )}
      <button
        type={onSubmit ? 'button' : 'submit'}
        data-testid="button-modal-submit"
        onClick={onSubmit || (!cancel ? onClose : undefined)}
        className="btn-primary justify-center"
      >
        {submitLabel}
      </button>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[.07em] text-[#68776e]">
        {label}
      </span>
      {children}
    </label>
  );
}
