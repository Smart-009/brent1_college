import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    'import.meta.env.ADMIN_PASSWORD': JSON.stringify(process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'Brent@2026#!'),
    'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'Brent@2026#!'),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Brent College School Management & Learning Portal',
        short_name: 'Brent College',
        description: 'Comprehensive School Information System, Master Timetables, Terminal Examinations, M-Pesa Fee Portal, and Lesson LMS for Brent College Nairobi.',
        theme_color: '#1E3A8A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Student Portal',
            short_name: 'Student',
            description: 'Access student dashboard, grades, and lessons',
            url: '/student',
            icons: [{ src: 'logo.png', sizes: '192x192' }],
          },
          {
            name: 'Master Timetable',
            short_name: 'Timetable',
            description: 'Daily class schedule and period planner',
            url: '/timetable',
            icons: [{ src: 'logo.png', sizes: '192x192' }],
          },
          {
            name: 'Exams & Transcripts',
            short_name: 'Exams',
            description: 'Semester modular examinations, college grading and academic transcripts',
            url: '/exams',
            icons: [{ src: 'logo.png', sizes: '192x192' }],
          },
          {
            name: 'Fees & M-Pesa',
            short_name: 'Fees',
            description: 'Paybill 247247 tuition clearance and receipts',
            url: '/fees',
            icons: [{ src: 'logo.png', sizes: '192x192' }],
          },
          {
            name: 'Digital Library',
            short_name: 'Library',
            description: 'Past national exam papers and revision materials',
            url: '/library',
            icons: [{ src: 'logo.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query'
            }
          }
        },
      },
    },
  },
})
