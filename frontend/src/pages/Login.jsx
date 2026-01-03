import React from 'react';
import ThemeToggle from '../components/ThemeToggle'; 

export default function Login() {
  return (
    // CONTAINER
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-500 bg-background dark:bg-dark-bg">
      
      {/* 1. TOGGLE BUTTON (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* 2. BACKGROUND BLOBS */}
      {/* Light Mode Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blob1 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float dark:hidden"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blob2 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-delayed dark:hidden"></div>
      
      {/* Dark Mode Blobs */}
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-dark-glowGreen rounded-full filter blur-[100px] opacity-60 animate-float"></div>
      <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-dark-glowOrange rounded-full filter blur-[100px] opacity-60 animate-float-delayed"></div>


      {/* 3. THE CARD */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl transition-all duration-500
                      bg-surface/80 backdrop-blur-xl border border-white/50
                      dark:bg-white/5 dark:backdrop-blur-2xl dark:border-white/10 dark:shadow-black/50">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-text-main dark:text-dark-text">Welcome Back</h1>
          <p className="text-sm text-text-muted dark:text-dark-muted">Please enter your details to continue</p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          
          {/* Username Input */}
          <div className="space-y-2">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Username"
                className="w-full px-4 py-3.5 pl-10 rounded-xl outline-none transition-all duration-300
                           bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20
                           dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500 dark:focus:ring-white/10"
              />
              {/* Icon */}
              <svg className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-primary dark:group-focus-within:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="relative group">
              <input 
                type="password" 
                placeholder="Password"
                className="w-full px-4 py-3.5 pl-10 rounded-xl outline-none transition-all duration-300
                           bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20
                           dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500 dark:focus:ring-white/10"
              />
              <svg className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-primary dark:group-focus-within:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
          </div>

          <button 
            type="button"
            onClick={()=> navigate('/dashboard')}
            className="w-full py-3.5 px-4 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transform hover:-translate-y-0.5 transition-all duration-300
                       bg-gradient-to-r from-primary to-accent text-white
                       dark:bg-gradient-to-r dark:from-dark-btnStart dark:to-dark-btnEnd"
          >
            Sign In &rarr;
          </button>

        </form>
      </div>
    </div>
  );
}