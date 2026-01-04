import React from 'react';
import { Mail, MoreHorizontal } from 'lucide-react';

export default function TeamMemberCard({ member }) {
  // Generate banner color if not provided
  const bannerColors = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-orange-400 to-amber-300",
    "from-emerald-500 to-teal-400",
    "from-indigo-500 to-blue-400",
    "from-slate-600 to-slate-500"
  ];
  const bannerColor = member.bannerColor || bannerColors[(member.id || 0) % bannerColors.length];
  
  // Get initials
  const getInitials = () => {
    if (member.name) {
      return member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    } else if (member.username) {
      return member.username.slice(0, 2).toUpperCase();
    } else if (member.firstName && member.lastName) {
      return (member.firstName[0] + member.lastName[0]).toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const displayName = member.name || 
    (member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : member.username) || 
    'Unknown User';

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300
      bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1
      dark:bg-[#1e293b]/60 dark:backdrop-blur-md dark:border-white/5 dark:shadow-none">
      
      {/* 1. Top Banner */}
      <div className={`h-24 w-full bg-gradient-to-r ${bannerColor} opacity-90 relative p-4 flex justify-between items-start`}>
        
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center shadow-lg backdrop-blur-sm
            bg-white text-gray-900 
            dark:bg-[#0f172a] dark:text-white"> 
            
            <span className="text-xl font-bold drop-shadow-sm">
              {getInitials()}
            </span>
          </div>
          
          {/* Status Dot - default to offline if not provided */}
          <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white/40
            ${member.status === 'online' ? 'bg-emerald-400' : member.status === 'busy' ? 'bg-amber-400' : 'bg-gray-400'}`} 
          />
        </div>

        {/* Menu Button */}
        <button className="text-white/70 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* 2. Content Area */}
      <div className="px-4 py-4 flex-1 flex flex-col">
        
        {/* Name & Role */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">{displayName}</h3>
          <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wide">{member.role || 'MEMBER'}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5">
            <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Email</p>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-300 mt-0.5 truncate">{member.email || 'N/A'}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5">
            <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Username</p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5 truncate">{member.username || 'N/A'}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex gap-2">
          <button className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all
            bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300
            dark:bg-white/5 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:border-white/20">
            View Profile
          </button>
          <button className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center">
            <Mail size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}