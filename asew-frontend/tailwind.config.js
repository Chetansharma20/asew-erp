/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                role: {
                    'super-admin': { DEFAULT: '#5b21b6', light: '#7c3aed' },
                    'admin': { DEFAULT: '#1e40af', light: '#3b82f6' },
                    'sub-admin': { DEFAULT: '#0e7490', light: '#06b6d4' },
                    'staff': { DEFAULT: '#0d9488', light: '#14b8a6' },
                }
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
            }
        },
    },
    plugins: [],
}
