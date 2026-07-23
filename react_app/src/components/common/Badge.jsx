import React from 'react';

export function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    info: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 ring-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 ring-rose-500/30'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
