
import React, { useState } from 'react';
import { SectionHeader, DataTable, Badge } from './Shared';
import { MOCK_TRANSACTIONS } from '../constants';

const Accounting: React.FC = () => {
  const [view, setView] = useState('queue');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <SectionHeader title="Finance & Ledger" subtitle="General ledger, commission claims, and QuickBooks sync." />
        <div className="flex gap-2">
          <button className="bg-slate-100 border border-slate-300 px-4 py-2 text-[10px] font-bold tracking-widest hover:bg-slate-200 transition-colors">
            SYNC TO QUICKBOOKS
          </button>
          <button className="bg-paragon text-white px-4 py-2 text-[10px] font-bold tracking-widest hover:bg-paragon-dark transition-colors">
            GENERATE REPORT
          </button>
        </div>
      </div>

      <div className="flex gap-8 mb-8 text-[10px] font-bold tracking-widest border-b border-slate-200">
        <button onClick={() => setView('queue')} className={`pb-4 ${view === 'queue' ? 'text-paragon border-b-2 border-paragon' : 'text-slate-400'}`}>TX QUEUE</button>
        <button onClick={() => setView('ar')} className={`pb-4 ${view === 'ar' ? 'text-paragon border-b-2 border-paragon' : 'text-slate-400'}`}>AR BY CUSTOMER</button>
        <button onClick={() => setView('commissions')} className={`pb-4 ${view === 'commissions' ? 'text-paragon border-b-2 border-paragon' : 'text-slate-400'}`}>COMMISSIONS</button>
        <button onClick={() => setView('pl')} className={`pb-4 ${view === 'pl' ? 'text-paragon border-b-2 border-paragon' : 'text-slate-400'}`}>PROFIT & LOSS</button>
      </div>

      {view === 'queue' && (
        <DataTable headers={['Date', 'Transaction ID', 'Description', 'Category', 'Type', 'Amount', 'Status', 'Audit']}>
          {MOCK_TRANSACTIONS.map(tx => (
            <tr key={tx.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">{tx.date}</td>
              <td className="px-4 py-3 font-mono">{tx.id}</td>
              <td className="px-4 py-3 font-semibold">{tx.description}</td>
              <td className="px-4 py-3">{tx.category}</td>
              <td className="px-4 py-3">
                <span className={tx.type === 'DEBIT' ? 'text-red-600' : 'text-emerald-600'}>{tx.type}</span>
              </td>
              <td className="px-4 py-3 font-bold">${tx.amount.toLocaleString()}</td>
              <td className="px-4 py-3"><Badge color={tx.status === 'POSTED' ? 'teal' : 'gold'}>{tx.status}</Badge></td>
              <td className="px-4 py-3"><button className="text-slate-400 hover:text-paragon text-[10px] font-bold">REVIEW</button></td>
            </tr>
          ))}
        </DataTable>
      )}

      {view === 'ar' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
            <h3 className="text-xs font-bold mb-4 uppercase text-slate-500">Accounts Receivable Aging</h3>
            <div className="flex gap-4">
              {[ { l: 'Current', v: 45000 }, { l: '31-60', v: 12000 }, { l: '61-90', v: 5500 }, { l: '90+', v: 2100 }].map((d, i) => (
                <div key={i} className="flex-1 bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] text-slate-400 mb-1">{d.l}</div>
                  <div className="text-lg font-cinzel font-bold text-slate-900">${d.v.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
