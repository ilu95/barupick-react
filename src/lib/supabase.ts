import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ywqaxxcvzhwhascbkyhp.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cWF4eGN2emh3aGFzY2JreWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjkwNzQsImV4cCI6MjA4ODU0NTA3NH0.J6cG4PRaG0ldNYcXzVOCAvcI1qypjmxh1NRA5Dc2tsw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,  // OAuth 리다이렉트 처리
  },
})

// 프로덕션 전환 시:
// VITE_SUPABASE_URL=https://kwcogjzwpnvqwmifizce.supabase.co
// VITE_SUPABASE_ANON_KEY=<프로덕션 anon key>
// .env.local 또는 Vercel 환경 변수로 설정
