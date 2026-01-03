/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LIGHT THEME (Keep your existing mint colors)
        background: "#e3e5cbff", 
        surface: "#ffffff",
        primary: "#4a5d4f",    
        accent: "#d97706",     
        blob1: "#bbf7d0",      
        blob2: "#fdba74",      

        // DARK THEME (Extracted from your image)
        dark: {
          bg: "#18181b",         // Zinc-900 (Deep background)
          card: "rgba(30, 41, 59, 0.7)", // Semi-transparent slate
          input: "#0f172a",      // Very dark slate (for input fields)
          text: "#f8fafc",       // White text
          muted: "#94a3b8",      // Grey text
          
          // The Glow Colors
          glowGreen: "#14532d",  // Deep Forest Green (Left blob)
          glowOrange: "#7c2d12", // Deep Burnt Orange (Right blob)
          
          // The Button Gradient
          btnStart: "#3f6212",   // Mossy Green
          btnEnd: "#ca8a04",     // Earthy Gold
        },

        text: {
          main: "#1c1917",     
          muted: "#78716c"     
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        }
        
      },
      backgroundImage: {
        // Light: Soft subtle gradient
        'orbit-light': 'linear-gradient(to bottom right, #e4e7e4, #f5f7f5)',
        
        // Dark: The "Orbit" Deep Radial Gradient
        // Starts dark slate, fades to deep black at edges
        'orbit-dark': 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 40%, #020617 100%)',
      },
    },
  },
  plugins: [],
}
 