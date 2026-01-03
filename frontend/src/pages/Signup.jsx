import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle'; 

export default function Signup() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'MEMBER' // Default role per requirements =
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Future connection to user-service:8080 
      console.log('Registering user with status: INACTIVE', formData);
      
      // Success simulation reflecting Admin activation requirement 
      setSuccessMsg("Registration successful! Your account is pending Admin activation.");
      
      // Redirect back to login after a delay
      setTimeout(() => navigate('/'), 3000); 
    } catch (err) {
      setErrorMsg("Connection to User Service failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-500 bg-background dark:bg-dark-bg py-10">
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* BACKGROUND BLOBS (Same as Login) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blob1 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float dark:hidden"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blob2 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-delayed dark:hidden"></div>
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-dark-glowGreen rounded-full filter blur-[100px] opacity-60 animate-float"></div>
      <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-dark-glowOrange rounded-full filter blur-[100px] opacity-60 animate-float-delayed"></div>

      {/* THE CARD */}
      <div className="relative z-10 w-full max-w-lg p-8 rounded-3xl shadow-2xl transition-all duration-500
                      bg-surface/80 backdrop-blur-xl border border-white/50
                      dark:bg-white/5 dark:backdrop-blur-2xl dark:border-white/10 dark:shadow-black/50">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-text-main dark:text-dark-text">Create Account</h1>
          <p className="text-sm text-text-muted dark:text-dark-muted">Please fill in your details to register</p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          
          {/* First & Last Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <input 
              name="firstName" placeholder="First Name" required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500"
            />
            <input 
              name="lastName" placeholder="Last Name" required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Username */}
          <input 
            name="username" placeholder="Username" required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500"
          />

          {/* Email */}
          <input 
            name="email" type="email" placeholder="Email" required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500"
          />

          {/* Password */}
          <input 
            name="password" type="password" placeholder="Password" required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500"
          />

          {/* Role Selection Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1 uppercase tracking-wider">Select Role</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all dark:bg-dark-input dark:border-transparent dark:text-white cursor-pointer"
            >
              <option value="MEMBER">Team Member</option>
              <option value="TEAM_LEADER">Team Leader</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-sm font-medium text-center">
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 px-4 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transform hover:-translate-y-0.5 transition-all duration-300
                       bg-gradient-to-r from-primary to-accent text-white
                       dark:bg-gradient-to-r dark:from-dark-btnStart dark:to-dark-btnEnd
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register \u2192'}
          </button>

          {/* Link back to Login */}
          <div className="text-center mt-4">
            <p className="text-sm text-text-muted dark:text-dark-muted">
              Already have an account?{' '}
              <Link to="/" className="text-primary hover:underline font-semibold dark:text-dark-text">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}