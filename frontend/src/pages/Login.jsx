import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle'; 

export default function Login() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // This will be replaced with our user-service API call (Port 8080)
      console.log('Attempting login with custom microservice...');
      
      // Placeholder logic for now
      if (email === "test@tuc.gr" && password === "password") {
         navigate('/dashboard');
      } else {
         setErrorMsg("Invalid credentials or account not activated by Admin.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to User Service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-500 bg-background dark:bg-dark-bg">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* BACKGROUND BLOBS (Your Original Styling) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blob1 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float dark:hidden"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blob2 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-delayed dark:hidden"></div>
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-dark-glowGreen rounded-full filter blur-[100px] opacity-60 animate-float"></div>
      <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-dark-glowOrange rounded-full filter blur-[100px] opacity-60 animate-float-delayed"></div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl transition-all duration-500
                      bg-surface/80 backdrop-blur-xl border border-white/50
                      dark:bg-white/5 dark:backdrop-blur-2xl dark:border-white/10 dark:shadow-black/50">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-text-main dark:text-dark-text">Welcome Back</h1>
          <p className="text-sm text-text-muted dark:text-dark-muted">Please enter your details to continue</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 pl-10 rounded-xl outline-none transition-all duration-300
                           bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20
                           dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500 dark:focus:ring-white/10"
              />
              <svg className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 pl-10 rounded-xl outline-none transition-all duration-300
                           bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20
                           dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500 dark:focus:ring-white/10"
              />
              <svg className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 px-4 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transform hover:-translate-y-0.5 transition-all duration-300
                       bg-gradient-to-r from-primary to-accent text-white
                       dark:bg-gradient-to-r dark:from-dark-btnStart dark:to-dark-btnEnd
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In \u2192'}
          </button>

          {/* NEW: LINK TO SIGNUP */}
          <div className="text-center mt-6">
            <p className="text-sm text-text-muted dark:text-dark-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-semibold dark:text-dark-text">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}