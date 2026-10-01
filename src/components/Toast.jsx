import React from 'react';
import { CheckCircle, Info, WarningCircle } from '@phosphor-icons/react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-message">
          <CheckCircle size={18} weight="bold" className="toast-icon" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
