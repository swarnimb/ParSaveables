#!/usr/bin/env node

/**
 * Publish Episode 1 to Supabase
 * Uploads audio file to Supabase Storage and creates database record
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function publishEpisode1() {
  console.log('📤 Publishing Episode 1...\n');

  const audioPath = path.join(__dirname, 'output', 'ParSaveables-EP01-ElevenLabs.mp3');
  const scriptPath = path.join(__dirname, 'output', 'Par-Saveables-EP01-Script.txt');

  // Check if files exist
  if (!await fs.pathExists(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }
  if (!await fs.pathExists(scriptPath)) {
    throw new Error(`Script file not found: ${scriptPath}`);
  }

  // Get file stats
  const audioStats = await fs.stat(audioPath);
  const fileSizeMB = (audioStats.size / (1024 * 1024)).toFixed(2);

  console.log(`✓ Audio file: ${fileSizeMB} MB`);

  // Read audio file
  const audioBuffer = await fs.readFile(audioPath);
  const scriptText = await fs.readFile(scriptPath, 'utf-8');

  // Upload to Supabase Storage
  console.log('⬆️  Uploading to Supabase Storage...');

  const fileName = 'ParSaveables-EP01.mp3';
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('podcast-episodes')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true // Overwrite if exists
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  console.log(`✓ Uploaded to: ${uploadData.path}`);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('podcast-episodes')
    .getPublicUrl(fileName);

  const audioUrl = urlData.publicUrl;
  console.log(`✓ Public URL: ${audioUrl}`);

  // Insert episode record
  console.log('\n💾 Creating database record...');

  const episodeData = {
    episode_number: 1,
    title: 'The Ruckus Until Now',
    description: 'Episode 1 covers the complete journey: Minneapolis 2024 tournament that started it all, the first full ParSaveables season in 2025, the drama-filled Portlandia finale, and a preview of 2026 with new players joining the fray.',
    type: 'season_recap',
    period_start: '2024-01-01',
    period_end: '2025-11-29',
    audio_url: audioUrl,
    duration_seconds: 423, // ~7 minutes
    file_size_mb: parseFloat(fileSizeMB),
    event_ids: [], // Will need to populate with actual event IDs
    total_rounds_covered: 0, // Will calculate later
    published_at: new Date().toISOString(),
    is_published: true
  };

  const { data: episodeRecord, error: episodeError } = await supabase
    .from('podcast_episodes')
    .insert(episodeData)
    .select()
    .single();

  if (episodeError) {
    throw new Error(`Database insert failed: ${episodeError.message}`);
  }

  console.log(`✓ Episode created with ID: ${episodeRecord.id}`);

  // Insert script record
  console.log('📝 Saving script...');

  const wordCount = scriptText.split(/\s+/).length;

  const scriptData = {
    episode_id: episodeRecord.id,
    script_text: scriptText,
    estimated_duration_minutes: 7,
    word_count: wordCount,
    generated_by: 'claude-sonnet-4',
    status: 'approved'
  };

  const { error: scriptError } = await supabase
    .from('podcast_scripts')
    .insert(scriptData);

  if (scriptError) {
    throw new Error(`Script insert failed: ${scriptError.message}`);
  }

  console.log(`✓ Script saved (${wordCount} words)`);

  console.log('\n✅ Episode 1 published successfully!');
  console.log(`🎧 Listen at: https://par-saveables.vercel.app/dashboard#podcast\n`);
}

publishEpisode1().catch((error) => {
  console.error('\n❌ Publication failed:', error.message);
  process.exit(1);
});
