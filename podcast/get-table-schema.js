import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getTables() {
  const tables = ['podcast_episodes', 'podcast_generation_logs', 'podcast_scripts'];
  
  for (const table of tables) {
    console.log(`\n=== ${table} ===`);
    const { data, error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Columns:', Object.keys(data?.[0] || {}));
    }
  }
}

getTables();
