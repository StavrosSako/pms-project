import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import TeamMemberCard from '../components/TeamMemberCard';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';

export default function MemberDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const { members, loading, error } = useTeam();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  if (user && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filtered = (members || []).filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.studentId?.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All available members in Orbit.</p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
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

          <button className="p-2 rounded-xl border transition-colors
            bg-white border-gray-200 text-gray-600 hover:bg-gray-50
            dark:bg-[#0f172a] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#1e293b]">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-center">
          Error loading members: {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-xl bg-gray-50 dark:bg-white/5 text-center text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No members match your search' : 'No members found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(member => (
            <TeamMemberCard key={member.id || member._id} member={member} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
