/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Base surfaces — Light Theme custom variables */
        base:    'var(--color-bg-base)',
        surface: 'var(--color-bg-surface)',
        elevated:'var(--color-bg-elevated)',
        overlay: 'var(--color-bg-overlay)',

        /* Text */
        light:        'var(--color-text-light)',
        'light-muted':'var(--color-text-muted)',
        'light-faint':'var(--color-text-faint)',

        /* Primary — Rose Gold */
        primary: {
          900: '#3D1A12',
          700: '#A0452A',
          500: '#E8956D',
          400: '#F0AB87',
          300: '#F5C7A9',
          DEFAULT: '#E8956D',
          dark:    '#A0452A',
          light:   '#F0AB87',
        },

        /* Accent — Periwinkle */
        accent: {
          700: '#4A4DAF',
          500: '#8B8FFF',
          400: '#A8ABFF',
          300: '#C5C7FF',
          DEFAULT: '#8B8FFF',
          dark:    '#4A4DAF',
          light:   '#A8ABFF',
        },

        /* Sage — soft support hue */
        sage: {
          700: '#3D6B58',
          500: '#7DC4A0',
          400: '#99D4B5',
          300: '#B5E4CC',
          DEFAULT: '#7DC4A0',
        },

        /* Semantic */
        success: '#4ADE80',
        warning: '#FBBF24',
        error:   '#F87171',
        info:    '#60A5FA',
      },

      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        'glass':           '0 8px 32px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card':            '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
        'float':           '0 24px 64px rgba(0,0,0,0.6)',
        'glow-primary':    '0 0 40px rgba(232,149,109,0.35), 0 8px 32px rgba(0,0,0,0.4)',
        'glow-accent':     '0 0 40px rgba(139,143,255,0.35), 0 8px 32px rgba(0,0,0,0.4)',
        'glow-sage':       '0 0 40px rgba(125,196,160,0.30), 0 8px 32px rgba(0,0,0,0.4)',
        'glow-sm-primary': '0 0 20px rgba(232,149,109,0.30)',
        'glow-sm-accent':  '0 0 20px rgba(139,143,255,0.30)',
        'inner-glow':      'inset 0 0 30px rgba(232,149,109,0.06)',
        'bento':           '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      backgroundImage: {
        'gradient-primary':   'linear-gradient(135deg, #E8956D 0%, #A0452A 100%)',
        'gradient-accent':    'linear-gradient(135deg, #8B8FFF 0%, #4A4DAF 100%)',
        'gradient-sage':      'linear-gradient(135deg, #7DC4A0 0%, #3D6B58 100%)',
        'gradient-warm':      'linear-gradient(135deg, #E8956D 0%, #8B8FFF 100%)',
        'gradient-aurora':    'linear-gradient(135deg, #1E1020 0%, #0F1420 50%, #0A1A16 100%)',
        'gradient-mesh':      'radial-gradient(at 30% 20%, rgba(232,149,109,0.12) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(139,143,255,0.10) 0px, transparent 50%), radial-gradient(at 10% 80%, rgba(125,196,160,0.08) 0px, transparent 50%)',
      },

      backdropBlur: {
        xs:      '2px',
        sm:      '8px',
        DEFAULT: '20px',
        heavy:   '40px',
      },

      animation: {
        'float':           'float 7s ease-in-out infinite',
        'float-slow':      'float 11s ease-in-out infinite',
        'float-delayed':   'float 9s ease-in-out 3s infinite',
        'aurora':          'aurora 12s ease-in-out infinite',
        'shimmer':         'shimmer 1.5s infinite',
        'slide-up':        'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-in':         'fadeIn 0.4s ease forwards',
        'spin-slow':       'spin 4s linear infinite',
        'gradient-shift':  'gradientShift 8s ease infinite',
        'dot-pulse':       'dotPulse 1.4s infinite ease-in-out both',
        'count-up':        'countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'ticker':          'ticker 25s linear infinite',
        'spotlight':       'spotlight 6s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-14px) rotate(0.5deg)' },
          '66%':      { transform: 'translateY(-7px) rotate(-0.5deg)' },
        },
        aurora: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1) rotate(0deg)' },
          '33%':      { opacity: '0.8', transform: 'scale(1.08) rotate(3deg)' },
          '66%':      { opacity: '0.5', transform: 'scale(0.95) rotate(-2deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        dotPulse: {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%':           { transform: 'scale(1.2)', opacity: '1' },
        },
        countUp: {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        spotlight: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.15)' },
        },
      },

      spacing: {
        '18':  '4.5rem',
        '88':  '22rem',
        '128': '32rem',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
      },
    },
  },
  plugins: [],
}
