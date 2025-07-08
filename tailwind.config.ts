
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#8B5CF6',
					light: '#A855F7',
					dark: '#7C3AED',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#F59E0B',
					light: '#FBBF24',
					dark: '#D97706',
					foreground: '#1F2937'
				},
				accent: {
					DEFAULT: '#F3F4F6',
					dark: '#E5E7EB',
					foreground: '#374151'
				},
				kija: {
					purple: '#8B5CF6',
					'purple-light': '#A855F7',
					'purple-dark': '#7C3AED',
					gold: '#F59E0B',
					'gold-light': '#FBBF24',
					'gold-dark': '#D97706',
					white: '#FFFFFF',
					gray: '#F8FAFC',
					'gray-dark': '#64748B',
					success: '#10B981',
					error: '#EF4444'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
			},
			animation: {
				'fade-in': 'fadeIn 0.6s ease-out',
				'slide-up': 'slideUp 0.5s ease-out',
				'bounce-gentle': 'bounceGentle 2s infinite',
				'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'gradient': 'gradient 3s ease infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				bounceGentle: {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-10px)' },
					'60%': { transform: 'translateY(-5px)' }
				},
				pulseSoft: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				gradient: {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'acai-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #F59E0B 100%)',
				'purple-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
				'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
				'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
			},
			boxShadow: {
				'kija': '0 10px 40px -10px rgba(139, 92, 246, 0.3)',
				'kija-lg': '0 20px 60px -10px rgba(139, 92, 246, 0.4)',
				'gold': '0 10px 40px -10px rgba(245, 158, 11, 0.3)',
				'soft': '0 2px 20px -2px rgba(0, 0, 0, 0.1)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
