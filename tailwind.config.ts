import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        ping: 'ping 5s infinite',
        slowPingRotate: 'slowPingRotate 5s ease-in-out infinite',
        slowRotate: 'slowRotate 5s ease-in-out infinite',
        moveSkew: 'moveSkew 2s ease-in-out infinite alternate',
      },
      keyframes: {
        slowRotate: {
          '0%': {
            transform: 'rotate(0deg)', // Start with no rotation
            opacity: '0.75', // Start with less opacity for ping effect
          },
          '50%': {
            transform: 'rotate(180deg)', // Half rotation
            opacity: '0', // Ping fades out
          },
          '100%': {
            transform: 'rotate(360deg)', // Full rotation
            opacity: '0.75', // Fade back in for the ping effect
          },
        },
        slowPingRotate: {
          '0%': {
            transform: 'rotate(0deg)', // Start with no rotation
            opacity: '0.75', // Start with less opacity for ping effect
            scale: '1.0'
          },
          '50%': {
            transform: 'rotate(180deg)', // Half rotation
            opacity: '0', // Ping fades out
            scale: '1.3'
          },
          '100%': {
            transform: 'rotate(360deg)', // Full rotation
            opacity: '0.75', // Fade back in for the ping effect
            scale: '1.0'
          },
        },
        ping: {
          '0%': { transform: 'scale(0)', opacity: '0.9' },
          '75%': { transform: 'scale(0.5)', opacity: '0.7' },
          '100%': { transform: 'scale(1.2)', opacity: '0.1' },
        },
        moveSkew: {
          '0%': { transform: 'translateX(0) rotate(0deg)' },
          '80%': { transform: 'translateX(20px) rotateX(0deg)' },
          '100%': { transform: 'translateX(20px) rotateX(180deg)' },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
