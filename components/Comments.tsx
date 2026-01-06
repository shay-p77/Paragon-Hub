
import React, { useState } from 'react';
import { Comment, User } from '../types';
import { MOCK_USERS } from '../constants';

interface CommentsProps {
  parentId: string;
  currentUser: User;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

const Comments: React.FC<CommentsProps> = ({ parentId, currentUser, comments, onAddComment }) => {
  const [text, setText] = useState('');
  const elementComments = comments.filter(c => c.parentId === parentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text);
    setText('');
  };

  const renderText = (t: string) => {
    // Basic regex for @u1, @u2, etc.
    const parts = t.split(/(@u\d+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@u')) {
        const userId = part.substring(1);
        const user = MOCK_USERS.find(u => u.id === userId);
        return <span key={i} className="text-paragon font-bold">{user ? `@${user.name}` : part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-sm mt-4">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Comments & Collaboration</h4>
      </div>
      
      <div className="p-4 space-y-4 max-h-60 overflow-auto">
        {elementComments.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic text-center py-4">No comments yet. Tag users using @name.</p>
        ) : (
          elementComments.map(c => {
            const author = MOCK_USERS.find(u => u.id === c.authorId);
            return (
              <div key={c.id} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                  {author?.name.charAt(0)}
                </div>
                <div>
                   <div className="flex gap-2 items-center mb-0.5">
                      <span className="text-[10px] font-bold text-slate-900">{author?.name}</span>
                      <span className="text-[9px] text-slate-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   <div className="text-[11px] text-slate-700 leading-normal">
                      {renderText(c.text)}
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Write a comment... (use @u1, @u2 to tag)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 p-2 text-xs border border-slate-200 outline-none focus:ring-1 focus:ring-paragon"
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">Post</button>
        </div>
        <div className="mt-2 flex gap-3">
           <span className="text-[8px] text-slate-400 font-bold uppercase">Quick Tag:</span>
           {MOCK_USERS.filter(u => u.id !== currentUser.id).map(u => (
              <button 
                key={u.id}
                type="button"
                onClick={() => setText(prev => prev + ` @${u.id} `)}
                className="text-[8px] text-paragon hover:underline font-bold"
              >
                +{u.name.split(' ')[0]}
              </button>
           ))}
        </div>
      </form>
    </div>
  );
};

export default Comments;
