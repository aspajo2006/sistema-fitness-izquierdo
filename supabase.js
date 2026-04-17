// ─────────────────────────────────────────────────────────────────────────────
//  supabase.js  —  Configuración de Supabase
//
//  INSTRUCCIONES:
//  1. Ve a https://supabase.com y crea una cuenta gratuita
//  2. Crea un nuevo proyecto
//  3. En el panel ve a: Settings > API
//  4. Copia "Project URL" y pégalo en SUPABASE_URL
//  5. Copia "anon public" key y pégalo en SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL      = 'https://hymrohwqqkkovvutrman.supabase.co';   // 👈 Cambia esto
const SUPABASE_ANON_KEY = 'sb_publishable_JNUaDJy6Phplt61aQPLSpQ_3_auumdf';                  // 👈 Cambia esto

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
