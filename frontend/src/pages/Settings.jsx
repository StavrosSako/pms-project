import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { User, Bell, Lock, Camera, Save, Mail, Shield } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  // Render content based on tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'security': return <SecuritySettings />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* 1. Sidebar Navigation */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          {['profile', 'notifications', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium text-sm text-left
                ${activeTab === tab 
                  ? 'bg-white dark:bg-[#1e293b] text-primary shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 ring-1 ring-black/5' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white'
                }`}
            >
              {tab === 'profile' && <User size={18} />}
              {tab === 'notifications' && <Bell size={18} />}
              {tab === 'security' && <Lock size={18} />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="flex-1 w-full bg-white dark:bg-[#1e293b]/60 dark:backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
          {renderContent()}
        </div>

      </div>
    </DashboardLayout>
  );
}

// SUB-COMPONENTS 

const ProfileSettings = () => (
  <div className="space-y-8 animate-fade-in">
    
    {/* Header Section with Avatar */}
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-gray-100 dark:border-white/5">
      
      {/* Avatar with Edit Overlay */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-xl shadow-primary/20">
          <div className="w-full h-full rounded-full bg-white dark:bg-[#0f172a] flex items-center justify-center overflow-hidden relative">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">AM</span>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
              <Camera size={24} className="text-white mb-1" />
              <span className="text-[10px] text-white font-medium uppercase tracking-wide">Edit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Alex Morgan</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Student ID: 2024099</p>
        <div className="flex gap-2 justify-center sm:justify-start">
           <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">Team Leader</span>
        </div>
      </div>
    </div>

    {/* Form Inputs */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputGroup label="Full Name" value="Alex Morgan" icon={<User size={16} />} />
      <InputGroup label="Student ID" value="2024099" icon={<Shield size={16} />} disabled />
      <InputGroup label="Email Address" value="alex.m@tuc.gr" icon={<Mail size={16} />} />
      <InputGroup label="Department" value="Computer Science" disabled />
    </div>

    <div className="pt-6 flex justify-end">
      <button className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all
        bg-gradient-to-r from-primary to-accent">
        <Save size={18} />
        Save Changes
      </button>
    </div>
  </div>
);

const NotificationSettings = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Choose what updates you want to receive.</p>
    </div>
    
    <div className="space-y-4">
      <ToggleItem title="New Project Assignments" desc="Get notified when you are added to a project." />
      <ToggleItem title="Task Deadlines" desc="Receive alerts 24h before a task is due." checked />
      <ToggleItem title="Mentions & Comments" desc="When someone tags you in a comment." checked />
      <ToggleItem title="System Updates" desc="News about TUC Orbit platform." />
    </div>
  </div>
);

const SecuritySettings = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and account access.</p>
    </div>

    <div className="max-w-md space-y-5">
      <InputGroup label="Current Password" type="password" placeholder="••••••••" icon={<Lock size={16} />} />
      <InputGroup label="New Password" type="password" placeholder="••••••••" icon={<Lock size={16} />} />
      <InputGroup label="Confirm Password" type="password" placeholder="••••••••" icon={<Lock size={16} />} />
    </div>
    
    <div className="pt-2">
      <button className="px-6 py-2.5 rounded-xl border font-medium transition-colors
        bg-white border-gray-200 text-gray-700 hover:bg-gray-50
        dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
        Update Password
      </button>
    </div>
  </div>
);

// --- HELPER COMPONENTS ---

const InputGroup = ({ label, type = "text", value, placeholder, disabled, icon }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors">
        {icon}
      </div>
      <input 
        type={type} 
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium
          ${disabled 
            ? 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-[#0f172a]/50 dark:border-white/5 dark:text-gray-500 cursor-not-allowed' 
            : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-primary/50 dark:bg-[#0f172a] dark:border-white/10 dark:text-white dark:focus:bg-[#0f172a]'
          }`}
      />
    </div>
  </div>
);

const ToggleItem = ({ title, desc, checked }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
    </div>
    <div className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-out ${checked ? 'translate-x-5' : ''}`}></div>
    </div>
  </div>
);