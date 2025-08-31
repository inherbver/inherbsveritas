import type { Config } from "tailwindcss";
const colors = require('tailwindcss/colors')

// Supprimer les couleurs obsolètes
delete colors.lightBlue;
delete colors.warmGray;
delete colors.trueGray;
delete colors.coolGray;
delete colors.blueGray;

const config: Config = {
  darkMode: ["class", "class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
                ...colors,
                'dark': '#1a202c',
                'body-color': '#637381',
                'dark-6': '#8792a2',

                // === HerbisVeritas Brand Colors avec scales complètes ===
                // 🌱 Primary — Vert Olivier
                'hv-primary': {
                  50: 'rgb(var(--primary-50) / <alpha-value>)',   // #f4faf6
                  100: 'rgb(var(--primary-100) / <alpha-value>)', // #e6f2ea
                  200: 'rgb(var(--primary-200) / <alpha-value>)', // #cce5d4
                  300: 'rgb(var(--primary-300) / <alpha-value>)', // #a3d4b4
                  400: 'rgb(var(--primary-400) / <alpha-value>)', // #6bb98c
                  500: 'rgb(var(--primary-500) / <alpha-value>)', // #3e8e68 DEFAULT
                  600: 'rgb(var(--primary-600) / <alpha-value>)', // #326f52
                  700: 'rgb(var(--primary-700) / <alpha-value>)', // #275741
                  800: 'rgb(var(--primary-800) / <alpha-value>)', // #1c3e2e
                  900: 'rgb(var(--primary-900) / <alpha-value>)', // #132b20
                  DEFAULT: 'rgb(var(--primary-500) / <alpha-value>)',
                },

                // 🌸 Secondary — Lavande de Provence
                'hv-secondary': {
                  50: 'rgb(var(--secondary-50) / <alpha-value>)',   // #faf8fc
                  100: 'rgb(var(--secondary-100) / <alpha-value>)', // #f2eafd
                  200: 'rgb(var(--secondary-200) / <alpha-value>)', // #e1d4fa
                  300: 'rgb(var(--secondary-300) / <alpha-value>)', // #c9aef5
                  400: 'rgb(var(--secondary-400) / <alpha-value>)', // #a07ae8
                  500: 'rgb(var(--secondary-500) / <alpha-value>)', // #8156cc DEFAULT
                  600: 'rgb(var(--secondary-600) / <alpha-value>)', // #6944aa
                  700: 'rgb(var(--secondary-700) / <alpha-value>)', // #523586
                  800: 'rgb(var(--secondary-800) / <alpha-value>)', // #3a245f
                  900: 'rgb(var(--secondary-900) / <alpha-value>)', // #261642
                  DEFAULT: 'rgb(var(--secondary-500) / <alpha-value>)',
                },

                // ☀️ Accent — Soleil Méditerranéen
                'hv-accent': {
                  50: 'rgb(var(--accent-50) / <alpha-value>)',   // #fff9f0
                  100: 'rgb(var(--accent-100) / <alpha-value>)', // #ffefd9
                  200: 'rgb(var(--accent-200) / <alpha-value>)', // #ffdba8
                  300: 'rgb(var(--accent-300) / <alpha-value>)', // #ffbe70
                  400: 'rgb(var(--accent-400) / <alpha-value>)', // #ff9b38
                  500: 'rgb(var(--accent-500) / <alpha-value>)', // #f97416 DEFAULT
                  600: 'rgb(var(--accent-600) / <alpha-value>)', // #db5d0e
                  700: 'rgb(var(--accent-700) / <alpha-value>)', // #b4450a
                  800: 'rgb(var(--accent-800) / <alpha-value>)', // #7d2d07
                  900: 'rgb(var(--accent-900) / <alpha-value>)', // #4d1a03
                  DEFAULT: 'rgb(var(--accent-500) / <alpha-value>)',
                },

                // 🌞 Semantic Colors
                'hv-success': 'rgb(var(--success) / <alpha-value>)',   // #4ade80
                'hv-warning': 'rgb(var(--warning) / <alpha-value>)',   // #facc15
                'hv-error': 'rgb(var(--error) / <alpha-value>)',       // #dc2626
                'hv-info': 'rgb(var(--info) / <alpha-value>)',         // #0ea5e9

                // 🪨 Neutral — Calcaire
                'hv-neutral': {
                  50: 'rgb(var(--neutral-50) / <alpha-value>)',   // #fafaf9
                  100: 'rgb(var(--neutral-100) / <alpha-value>)', // #f5f5f4
                  200: 'rgb(var(--neutral-200) / <alpha-value>)', // #e7e5e4
                  300: 'rgb(var(--neutral-300) / <alpha-value>)', // #d6d3d1
                  400: 'rgb(var(--neutral-400) / <alpha-value>)', // #a8a29e
                  500: 'rgb(var(--neutral-500) / <alpha-value>)', // #78716c
                  600: 'rgb(var(--neutral-600) / <alpha-value>)', // #57534e
                  700: 'rgb(var(--neutral-700) / <alpha-value>)', // #44403c
                  800: 'rgb(var(--neutral-800) / <alpha-value>)', // #292524
                  900: 'rgb(var(--neutral-900) / <alpha-value>)', // #1c1917
                  DEFAULT: 'rgb(var(--neutral-500) / <alpha-value>)',
                },

                // === Tokens shadcn/ui ===
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
