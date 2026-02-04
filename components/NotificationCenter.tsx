
import React from 'react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkRead, onClearAll }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-white border border-slate-200 shadow-2xl rounded-xl z-[60] animate-slideUp">
      <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-900">Notifications ({unreadCount})</h3>
        <button onClick={onClearAll} className="text-[8px] sm:text-[9px] font-bold text-paragon hover:underline uppercase">Clear All</button>
      </div>
      <div className="max-h-[50vh] sm:max-h-96 overflow-auto divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">All caught up.</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors relative ${!n.read ? 'bg-paragon-light/30' : ''}`}
              onClick={() => onMarkRead(n.id)}
            >
              {!n.read && <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-paragon"></div>}
              <div className="flex gap-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                   n.type === 'TAG' ? 'bg-amber-100 text-amber-700' : 
                   n.type === 'ASSIGN' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'
                 }`}>
                   <span className="text-xs">
                     {n.type === 'TAG' ? '@' : n.type === 'ASSIGN' ? '!' : 'i'}
                   </span>
                 </div>
                 <div>
                    <p className="text-[11px] text-slate-800 leading-tight mb-1">{n.message}</p>
                    <p className="text-[9px] text-slate-400 font-mono uppercase tracking-tight">{new Date(n.timestamp).toLocaleTimeString()}</p>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-2 sm:p-3 border-t border-slate-100 bg-slate-50 text-center">
         <button className="text-[8px] sm:text-[9px] font-bold text-slate-500 hover:text-paragon uppercase tracking-widest">View All Activity</button>
      </div>
    </div>
  );
};

export default NotificationCenter;
