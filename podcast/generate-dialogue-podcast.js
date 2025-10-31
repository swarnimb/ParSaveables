#!/usr/bin/env node

/**
 * Par Saveables Dialogue Podcast Generator
 * Generates two-person dialogue podcast with Hyzer and Annie
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { createSupabaseClient, fetchSeasonData, fetchTournamentData } from './lib/data-fetcher.js';
import { generateDialogueScript, parseDialogue } from './lib/dialogue-script-generator.js';
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
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY
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
  console.log('║  🎙️  Par Saveables Dialogue Podcast Generator   ║');
  console.log('║     Hyzer & Annie - Season 2025 Recap            ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  try {
    // Initialize Supabase
    const supabase = createSupabaseClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

    // Step 1: Fetch data
    console.log('📊 Step 1/6: Fetching tournament data...\n');

    const [minneapolisData, seasonData, portlandiaData] = await Promise.all([
      fetchTournamentData(supabase, 'Minneapolis Disc Golf Classic 2024'),
      fetchSeasonData(supabase, 2025),
      fetchTournamentData(supabase, 'Portlandia 2025')
    ]);

    console.log(`✓ Minneapolis: ${minneapolisData.totalRounds} rounds`);
    console.log(`✓ Season 2025: ${seasonData.totalRounds} rounds`);
    console.log(`✓ Portlandia: ${portlandiaData.totalRounds} rounds\n`);

    // Custom snippets
    const customSnippets = {
      minneapolis: `- Pocket beer controversy between Butter Cookie and Jaguar
- Borrowed beer controversy between Jaguar and Jabba the Putt
- The ironic situation: Bird won 3 rounds but Intern Line Cook won the tournament due to the scoring format
- Biggest highlight: Cobra's ace in round 5`,

      season: `- The winner complained about not getting any prize for winning
- Others made fun saying he actually got the highest bed in the house during Portlandia tournament
- Sadly, NO aces in the entire season
- Two new entrants for 2026 season: Food Zaddy and Scarlet Speedster`,

      portlandia: `- Tournament marred by controversies after controversies, making for an intense and dramatic ending
- Beer trading controversy that could set a bad precedent for the future
- THE BIGGEST CONTROVERSY the sport has ever seen - but one that shall not be talked about (tease it but don't reveal what it is)`
    };

    // Step 2: Generate dialogue script
    console.log('✍️  Step 2/6: Generating dialogue script with Claude AI...\n');

    const scriptResult = await generateDialogueScript({
      apiKey: CONFIG.anthropic.apiKey,
      data: {
        year: 2025,
        minneapolis: minneapolisData,
        season: seasonData,
        portlandia: portlandiaData
      },
      customSnippets
    });

    console.log(`✓ Script generated: ${scriptResult.wordCount} words (~${scriptResult.estimatedMinutes} minutes)`);
    console.log(`✓ Cost: $${scriptResult.costUSD.toFixed(2)}\n`);

    // Parse dialogue
    const dialogue = parseDialogue(scriptResult.script);
    console.log(`✓ Parsed ${dialogue.length} dialogue segments`);
    console.log(`  - Hyzer: ${dialogue.filter(d => d.speaker === 'HYZER').length} lines`);
    console.log(`  - Annie: ${dialogue.filter(d => d.speaker === 'ANNIE').length} lines\n`);

    // Save script
    await fs.ensureDir(CONFIG.output.outputDir);
    const scriptPath = path.join(CONFIG.output.outputDir, 'Par-Saveables-EP01-Script.txt');
    await fs.writeFile(scriptPath, scriptResult.script);
    console.log(`✓ Script saved: ${scriptPath}\n`);

    // Step 3: Generate dialogue audio
    console.log('🎤 Step 3/6: Converting dialogue to audio with Google TTS...\n');

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
      const episodesLeft = Math.floor(audioResult.charactersRemaining / (audioResult.totalCharacters / dialogue.length) * dialogue.length / audioResult.totalCharacters);
      console.log(`  Estimated episodes left: ~${episodesLeft}`);
    }
    console.log();

    // Step 4: Mix with intro/outro
    console.log('🎵 Step 4/6: Mixing with intro/outro music...\n');

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
    console.log('📤 Step 5/6: Uploading to GitHub...\n');

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
        fileName: `Par-Saveables-EP01-Enhanced-v2.mp3`
      }
    });

    console.log(`✓ Upload complete!\n`);

    // Step 6: Save to database
    console.log('💾 Step 6/6: Saving to database...\n');

    const { data: episode, error } = await supabase
      .from('podcast_episodes')
      .upsert({
        episode_number: 1,
        title: 'Par Saveables Episode 1: 2025 Season Spectacular',
        description: 'Complete season recap with Hyzer and Annie',
        type: 'season_recap',
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        audio_url: uploadResult.audioUrl,
        duration_seconds: scriptResult.estimatedMinutes * 60,
        file_size_mb: uploadResult.audioSizeMB,
        event_ids: [minneapolisData.event.id, portlandiaData.event.id],
        total_rounds_covered: minneapolisData.totalRounds + seasonData.totalRounds + portlandiaData.totalRounds,
        published_at: new Date().toISOString(),
        is_published: true
      }, { onConflict: 'episode_number' })
      .select()
      .single();

    if (error) {
      console.warn(`⚠️  Database save error: ${error.message}`);
    } else {
      console.log(`✓ Episode saved (ID: ${episode.id})\n`);
    }

    console.log('✅ Dialogue podcast generated successfully!\n');
    console.log(`🎵 Audio URL: ${uploadResult.audioUrl}`);
    console.log(`📍 Release: ${uploadResult.releaseUrl}`);
    console.log(`💰 Total cost: $${scriptResult.costUSD.toFixed(2)}\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
