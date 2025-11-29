import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name IN ('podcast_episodes', 'podcast_generation_logs', 'podcast_scripts')
      ORDER BY table_name, ordinal_position;
    `
  });
  
  if (error) {
    console.log('Using alternate method...');
    // Try direct query
    const tables = ['podcast_episodes', 'podcast_generation_logs', 'podcast_scripts'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      console.log(`\n${table}:`, error || 'exists');
    }
  } else {
    console.log(data);
  }
}

checkSchema();
