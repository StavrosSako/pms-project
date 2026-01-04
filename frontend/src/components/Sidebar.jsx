import React from 'react';
import { LayoutDashboard, Users, FolderKanban, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth';


export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { user } = useAuth(); // Get user from auth hook

  const isAdmin = user?.role === 'ADMIN';

  // Inside Sidebar.jsx
  const handleLogout = async () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); 
      window.location.href = '/'; // Redirect to login
  };

  const menuItems = [
    { path: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Overview" }, 
    { path: "/projects", icon: <FolderKanban size={20} />, label: "Projects" },     
    { path: "/team", icon: <Users size={20} />, label: "Team" },
    ...(isAdmin ? [{ path: "/members", icon: <Users size={20} />, label: "Member Directory" }] : []),
    { path: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <aside className="w-full h-full flex flex-col border-r transition-all duration-300
      bg-surface/50 backdrop-blur-md border-white/20 text-text-main
      dark:bg-[#0f172a]/60 dark:backdrop-blur-xl dark:border-white/5 dark:text-gray-300">
      
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-gray-200/50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
            O
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white">
            TUC <span className="text-primary font-normal">Orbit</span>
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => {
          // Check if this item is active
          const isActive = location.pathname === item.path; 
          
          return (
            <Link
              to={item.path || '#'} // Links to path or # if not defined
              key={index}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-white shadow-sm' 
                  : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200/50 dark:border-white/5">
      <button
        onClick={handleLogout} //attaching the function
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}