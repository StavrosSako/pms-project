import { motion } from 'framer-motion';

export const Input = ({ icon: Icon, type, placeholder, value, onChange, id, required, className }) => (
  <div className="relative group">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
      </div>
    )}
    <input
      id={id}
      type={type}
      className={`block w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-surface border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none placeholder-text-muted text-text-main shadow-sm dark:bg-dark-input dark:border-transparent dark:text-white dark:placeholder-gray-500 ${className || ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

// The button automatically adapts to the new primary/accent colors
export const Button = ({ children, onClick, isLoading }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={isLoading}
    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
  >
    {isLoading ? "Processing..." : children}
  </motion.button>
);