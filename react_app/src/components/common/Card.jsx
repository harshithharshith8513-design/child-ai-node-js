import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

export default Card;
