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
        // LIGHT THEME 
        background: "#e3e5cbff", 
        surface: "#ffffff",
        primary: "#4a5d4f",    
        accent: "#d97706",     
        blob1: "#bbf7d0",      
        blob2: "#fdba74",      

        // DARK THEME 
        dark: {
          bg: "#18181b",         
          card: "rgba(30, 41, 59, 0.7)", 
          input: "#0f172a",      
          text: "#f8fafc",       
          muted: "#94a3b8",      
          
          // The Glow Colors
          glowGreen: "#14532d",  
          glowOrange: "#7c2d12", 
          
          // The Button Gradient
          btnStart: "#3f6212",   
          btnEnd: "#ca8a04",     
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
        'orbit-light': 'linear-gradient(to bottom right, #e4e7e4, #f5f7f5)',
        
        'orbit-dark': 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 40%, #020617 100%)',
      },
    },
  },
  plugins: [],
}
 