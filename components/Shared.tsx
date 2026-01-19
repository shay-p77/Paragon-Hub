
import React from 'react';

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4 sm:mb-6">
    <h2 className="font-cinzel text-base sm:text-xl font-bold text-slate-900 uppercase tracking-wide">{title}</h2>
    {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
  </div>
);

export const DataTable: React.FC<{
  headers: string[];
  children: React.ReactNode;
}> = ({ headers, children }) => (
  <div className="overflow-x-auto border border-slate-200 rounded-sm shadow-sm bg-white -mx-4 sm:mx-0">
    <table className="w-full text-left text-[10px] sm:text-[11px] uppercase tracking-tight min-w-[600px]">
      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">
        {children}
      </tbody>
    </table>
  </div>
);

export const Badge: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    gold: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border text-[8px] sm:text-[10px] font-bold whitespace-nowrap ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};
