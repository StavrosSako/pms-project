import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle'; 

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';
      const response = await fetch(`${API_BASE_URL}:8080/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      setSuccessMsg('Account created! Now you must activate it via terminal.');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background dark:bg-dark-bg transition-colors duration-500 overflow-hidden">
      <div className="absolute top-6 right-6 z-50"><ThemeToggle /></div>

      {/* Card Wrapper */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl bg-surface/80 backdrop-blur-xl border border-white/50 dark:bg-white/5 dark:border-white/10 transition-all duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-text-main dark:text-dark-text">Create Account</h1>
          <p className="text-sm text-text-muted dark:text-dark-muted">Join the project team</p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-4">
            <input name="first_name" placeholder="First Name" onChange={handleChange} required className="p-3 rounded-xl border dark:bg-dark-input dark:border-transparent dark:text-white" />
            <input name="last_name" placeholder="Last Name" onChange={handleChange} required className="p-3 rounded-xl border dark:bg-dark-input dark:border-transparent dark:text-white" />
          </div>
          <input name="username" placeholder="Username" onChange={handleChange} required className="w-full p-3 rounded-xl border dark:bg-dark-input dark:border-transparent dark:text-white" />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 rounded-xl border dark:bg-dark-input dark:border-transparent dark:text-white" />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full p-3 rounded-xl border dark:bg-dark-input dark:border-transparent dark:text-white" />

          {errorMsg && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-center">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-green-100 text-green-600 rounded-xl text-center">{successMsg}</div>}

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-all">
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-primary hover:underline">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}