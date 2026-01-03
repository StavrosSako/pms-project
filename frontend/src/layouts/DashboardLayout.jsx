import React from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Search, Bell } from 'lucide-react';

export default function DashboardLayout({ children }) {
  return (
    //  OUTER CONTAINER: Fixed height (h-screen), No Window Scroll (overflow-hidden)
    <div className="h-screen w-full overflow-hidden flex transition-colors duration-500 
      bg-orbit-light dark:bg-orbit-dark 
      bg-cover bg-fixed bg-no-repeat
      text-text-main dark:text-dark-text">
      
      <div className="w-64 h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/*  MAIN CONTENT AREA: Takes remaining width */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* HEADER: Stays at the top */}
        <header className="h-20 flex-shrink-0 px-8 flex items-center justify-between z-10
          bg-surface/50 backdrop-blur-md border-b border-gray-200/50
          dark:bg-[#0f172a]/40 dark:backdrop-blur-md dark:border-white/5">
          
          {/* Search Bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search tasks, projects..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100/50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all
                dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:bg-white/10"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-400 dark:hover:bg-white/10">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-surface dark:border-gray-900"></span>
            </button>
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold dark:text-white">Stavros Sako</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student ID: 2024099</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white dark:border-white/20 shadow-md"></div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE WORKSPACE: This is the ONLY thing that scrolls */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {children}
        </main>

      </div>
    </div>
  );
}