import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TeamMemberCard from '../components/TeamMemberCard';
import { Search, Filter } from 'lucide-react';

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('');

  const members = [
    { id: 1, name: "LOLIS K.", role: "Team Leader", studentId: "2024099", dept: "Computer Science", status: "online", bannerColor: "from-blue-500 to-cyan-400" },
    { id: 2, name: "Kostas K.", role: "Full Stack Dev", studentId: "2024102", dept: "Software Eng", status: "offline", bannerColor: "from-purple-500 to-pink-400" },
    { id: 3, name: "Stavros L.", role: "UI/UX Designer", studentId: "2024155", dept: "Product Design", status: "busy", bannerColor: "from-orange-400 to-amber-300" },
    { id: 4, name: "Dimitris P.", role: "Backend Dev", studentId: "2024008", dept: "Computer Science", status: "online", bannerColor: "from-emerald-500 to-teal-400" },
    { id: 5, name: "Elena K.", role: "QA Tester", studentId: "2024221", dept: "Info Systems", status: "offline", bannerColor: "from-indigo-500 to-blue-400" },
    { id: 6, name: "Makis K.", role: "DevOps Eng", studentId: "2024111", dept: "Network Eng", status: "online", bannerColor: "from-slate-600 to-slate-500" },
  ];

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.studentId.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage permissions and view team details.</p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          {/* Search Input - FIXED DARK MODE */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Find member..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-primary/20 transition-all
                bg-white border-gray-200 text-gray-800 placeholder-gray-400
                dark:bg-[#0f172a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          
          {/* Filter Button */}
          <button className="p-2 rounded-xl border transition-colors
            bg-white border-gray-200 text-gray-600 hover:bg-gray-50
            dark:bg-[#0f172a] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#1e293b]">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>

    </DashboardLayout>
  );
}