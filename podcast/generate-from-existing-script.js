#!/usr/bin/env node

/**
 * Par Saveables Dialogue Podcast Generator
 * Uses EXISTING script file (no Claude AI generation)
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { createSupabaseClient, fetchSeasonData, fetchTournamentData } from './lib/data-fetcher.js';
import { parseDialogue } from './lib/dialogue-script-generator.js';
import { generateDialogueAudio } from './lib/dialogue-audio-generator.js';
import { AudioMixer } from './lib/audio-mixer.js';
import { uploadPodcastEpisode } from './lib/github-uploader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  google: {
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'google-cloud-credentials.json')
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO || 'ParSaveables'
  },
  podcast: {
    showName: process.env.PODCAST_SHOW_NAME || 'Par Saveables',
    tagline: process.env.PODCAST_TAGLINE || 'The world of heavy bags, curses, and pocket beers'
  },
  audio: {
    introMusicPath: process.env.INTRO_MUSIC_PATH || path.join(__dirname, 'assets', 'intro-music.mp3'),
    outroMusicPath: process.env.OUTRO_MUSIC_PATH || path.join(__dirname, 'assets', 'outro-music.mp3'),
    introDuration: parseInt(process.env.INTRO_DURATION_SECONDS || '15'),
    outroDuration: parseInt(process.env.OUTRO_DURATION_SECONDS || '15')
  },
  output: {
    outputDir: process.env.OUTPUT_DIR || path.join(__dirname, 'output'),
    tempDir: process.env.TEMP_DIR || path.join(__dirname, 'temp')
  }
};

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  🎙️  Par Saveables Podcast Generator             ║');
  console.log('║     Using Existing Script                        ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  try {
    // Initialize Supabase
    const supabase = createSupabaseClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

    // Step 1: Fetch data for metadata only
    console.log('📊 Step 1/5: Fetching tournament data (for metadata)...\n');

    const [seasonData] = await Promise.all([
      fetchSeasonData(supabase, 2025)
    ]);

    console.log(`✓ Season 2025: ${seasonData.totalRounds} rounds\n`);

    // Step 2: Read existing script
    console.log('📖 Step 2/5: Reading existing script...\n');

    const scriptPath = path.join(CONFIG.output.outputDir, 'Par-Saveables-EP01-Script.txt');

    if (!await fs.pathExists(scriptPath)) {
      throw new Error(`Script file not found: ${scriptPath}\nPlease ensure the script file exists before running.`);
    }

    const scriptContent = await fs.readFile(scriptPath, 'utf-8');
    const wordCount = scriptContent.split(/\s+/).length;
    const estimatedMinutes = Math.ceil(wordCount / 150);

    console.log(`✓ Script loaded: ${wordCount} words (~${estimatedMinutes} minutes)`);

    // Parse dialogue
    const dialogue = parseDialogue(scriptContent);
    console.log(`✓ Parsed ${dialogue.length} dialogue segments`);
    console.log(`  - Hyzer: ${dialogue.filter(d => d.speaker === 'HYZER').length} lines`);
    console.log(`  - Annie: ${dialogue.filter(d => d.speaker === 'ANNIE').length} lines\n`);

    // Step 3: Generate dialogue audio
    console.log('🎤 Step 3/5: Converting dialogue to audio...\n');

    const voiceAudioPath = path.join(CONFIG.output.tempDir, 'dialogue-voice.mp3');

    const audioResult = await generateDialogueAudio({
      dialogue,
      outputPath: voiceAudioPath,
      credentialsPath: CONFIG.google.credentialsPath,
      voices: {
        HYZER: { name: 'en-US-Neural2-J', gender: 'MALE' },
        ANNIE: { name: 'en-US-Neural2-F', gender: 'FEMALE' }
      },
      tempDir: CONFIG.output.tempDir
    });

    console.log(`\n✓ Dialogue audio complete: ${voiceAudioPath}`);

    // Show character usage if using ElevenLabs
    if (audioResult.totalCharacters) {
      console.log(`\n📊 ElevenLabs Usage:`);
      console.log(`  Characters used: ${audioResult.totalCharacters}/10,000 (${audioResult.percentageUsed}%)`);
      console.log(`  Remaining: ${audioResult.charactersRemaining} characters`);
      const episodesLeft = Math.floor(audioResult.charactersRemaining / audioResult.totalCharacters);
      console.log(`  Estimated episodes left this month: ~${episodesLeft}`);
    }
    console.log();

    // Step 4: Mix with intro/outro
    console.log('🎵 Step 4/5: Mixing with intro/outro music...\n');

    const finalAudioPath = path.join(CONFIG.output.outputDir, 'Par-Saveables-Episode-1-2025-Season-Recap.mp3');

    const hasIntro = await fs.pathExists(CONFIG.audio.introMusicPath);
    const hasOutro = await fs.pathExists(CONFIG.audio.outroMusicPath);

    if (!hasIntro || !hasOutro) {
      console.warn(`⚠️  Music files missing. Using voice-only.`);
      await fs.copy(voiceAudioPath, finalAudioPath);
    } else {
      const mixer = new AudioMixer({
        introMusicPath: CONFIG.audio.introMusicPath,
        outroMusicPath: CONFIG.audio.outroMusicPath,
        introDuration: CONFIG.audio.introDuration,
        outroDuration: CONFIG.audio.outroDuration
      });
      await mixer.simpleConcatenate(voiceAudioPath, finalAudioPath);
    }

    console.log(`✓ Final podcast: ${finalAudioPath}\n`);

    // Step 5: Upload to GitHub
    console.log('📤 Step 5/5: Uploading to GitHub...\n');

    const uploadResult = await uploadPodcastEpisode({
      token: CONFIG.github.token,
      owner: CONFIG.github.owner,
      repo: CONFIG.github.repo,
      episode: {
        number: 1,
        title: `2025 Season Spectacular`,
        description: `The complete 2025 Par Saveables season recap! Hyzer and Annie break down Minneapolis 2024, the full season, and the dramatic Portlandia 2025 tournament.\n\n🎙️ Featuring: Pocket beer controversies, scoring format drama, and the biggest controversy that shall not be named!\n\n🏆 Season Winner: ${seasonData.stats.winner.name} (${Math.round(seasonData.stats.winner.totalPoints)} pts)\n\nThe world of heavy bags, curses, and pocket beers!`,
        type: 'season_recap',
        filePath: finalAudioPath,
        fileName: `Par-Saveables-EP01-ElevenLabs-v3.mp3`
      }
    });

    console.log(`✓ Upload complete!\n`);

    console.log('✅ Podcast generated successfully!\n');
    console.log(`🎵 Audio URL: ${uploadResult.audioUrl}`);
    console.log(`📍 Release: ${uploadResult.releaseUrl}`);
    if (audioResult.totalCharacters) {
      console.log(`📊 ElevenLabs: ${audioResult.totalCharacters}/10,000 chars (${audioResult.percentageUsed}%)\n`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
