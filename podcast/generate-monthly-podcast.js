#!/usr/bin/env node

/**
 * Monthly Podcast Generator (Automated)
 * Generates podcast episodes using INCREMENTAL data since last episode
 * This is the automated version that runs monthly
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { createSupabaseClient, fetchDataSinceLastEpisode } from './lib/data-fetcher.js';
import { generateDialogueScript, parseDialogue, buildIncrementalPrompt, generateEpisodeTitle } from './lib/dialogue-script-generator.js';
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
  tts: {
    provider: process.env.TTS_PROVIDER || 'elevenlabs', // 'elevenlabs' or 'google'
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY,
      hyzerVoice: process.env.ELEVENLABS_HYZER_VOICE || 'hWHihsTve3RbzG4PHDBQ',
      annieVoice: process.env.ELEVENLABS_ANNIE_VOICE || '54Cze5LrTSyLgbO6Fhlc'
    },
    google: {
      credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'google-cloud-credentials.json')
    }
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO || 'ParSaveables'
  },
  podcast: {
    showName: 'Par Saveables',
    tagline: 'The world of heavy bags, curses, and pocket beers'
  },
  audio: {
    introMusicPath: process.env.INTRO_MUSIC_PATH || path.join(__dirname, 'assets', 'intro-music.mp3'),
    outroMusicPath: process.env.OUTRO_MUSIC_PATH || path.join(__dirname, 'assets', 'outro-music.mp3'),
    introDuration: parseInt(process.env.INTRO_DURATION_SECONDS || '12'),
    outroDuration: parseInt(process.env.OUTRO_DURATION_SECONDS || '15')
  },
  output: {
    outputDir: path.join(__dirname, 'output'),
    tempDir: path.join(__dirname, 'temp')
  }
};

async function main() {
  const startTime = Date.now();

  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  🎙️  Par Saveables Monthly Podcast Generator    ║');
  console.log('║     Automated Incremental Episode Creation      ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  try {
    // Initialize Supabase
    const supabase = createSupabaseClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

    // STEP 1: Fetch incremental data since last episode
    console.log('📊 Step 1/8: Fetching NEW data since last episode...\n');

    const incrementalData = await fetchDataSinceLastEpisode(supabase);

    if (!incrementalData.hasNewData) {
      console.log(`⚠️  ${incrementalData.message}`);
      console.log('ℹ️  No podcast will be generated - waiting for more rounds.\n');
      process.exit(0);
    }

    const episodeNumber = incrementalData.nextEpisodeNumber;
    console.log(`✓ Episode #${episodeNumber} will cover ${incrementalData.totalNewRounds} new rounds`);
    console.log(`✓ Period: ${incrementalData.periodStart} to ${incrementalData.periodEnd}\n`);

    // Log generation to database
    const { data: logEntry } = await supabase
      .from('podcast_generation_logs')
      .insert({
        stage: 'script_generation',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    const logId = logEntry?.id;

    // STEP 2: Generate catchy episode title
    console.log('📝 Step 2/9: Generating episode title...\n');

    const episodeTitle = await generateEpisodeTitle({
      apiKey: CONFIG.anthropic.apiKey,
      incrementalData
    });

    console.log(`✓ Title: "${episodeTitle}"\n`);

    // STEP 3: Generate dialogue script using incremental prompt
    console.log('✍️  Step 3/9: Generating dialogue script with Claude AI...\n');

    const customPrompt = buildIncrementalPrompt(incrementalData);

    const scriptResult = await generateDialogueScript({
      apiKey: CONFIG.anthropic.apiKey,
      customPrompt
    });

    console.log(`✓ Script generated: ${scriptResult.wordCount} words (~${scriptResult.estimatedMinutes} min)`);
    console.log(`✓ AI Cost: $${scriptResult.costUSD.toFixed(2)}\n`);

    // Parse dialogue
    const dialogue = parseDialogue(scriptResult.script);
    console.log(`✓ Parsed ${dialogue.length} dialogue segments\n`);

    // STEP 4: Create episode record in database
    console.log('💾 Step 4/9: Creating episode record...\n');

    const { data: episode, error: episodeError } = await supabase
      .from('podcast_episodes')
      .insert({
        episode_number: episodeNumber,
        title: episodeTitle,
        description: `Episode ${episodeNumber}: ${episodeTitle} - Covering ${incrementalData.totalNewRounds} rounds from ${incrementalData.periodStart} to ${incrementalData.periodEnd}`,
        type: 'monthly_recap',
        period_start: incrementalData.periodStart,
        period_end: incrementalData.periodEnd,
        total_rounds_covered: incrementalData.totalNewRounds,
        is_published: false
      })
      .select()
      .single();

    if (episodeError) throw episodeError;

    console.log(`✓ Episode record created (ID: ${episode.id})\n`);

    // STEP 5: Save script to database
    console.log('📝 Step 5/9: Saving script to database...\n');

    await fs.ensureDir(CONFIG.output.outputDir);
    const scriptPath = path.join(CONFIG.output.outputDir, `EP${episodeNumber.toString().padStart(2, '0')}-Script.txt`);
    await fs.writeFile(scriptPath, scriptResult.script);

    await supabase
      .from('podcast_scripts')
      .insert({
        episode_id: episode.id,
        script_text: scriptResult.script,
        estimated_duration_minutes: scriptResult.estimatedMinutes,
        word_count: scriptResult.wordCount,
        generated_by: 'claude-sonnet-4-20250514',
        prompt_used: customPrompt,
        data_snapshot: {
          incrementalData,
          stats: incrementalData.stats,
          comparisonData: incrementalData.comparisonData
        },
        status: 'approved'
      });

    console.log(`✓ Script saved: ${scriptPath}\n`);

    // STEP 6: Generate audio
    console.log('🎤 Step 6/9: Converting dialogue to audio...\n');

    // Update log
    await supabase
      .from('podcast_generation_logs')
      .update({ stage: 'audio_generation' })
      .eq('id', logId);

    await fs.ensureDir(CONFIG.output.tempDir);
    const voiceAudioPath = path.join(CONFIG.output.tempDir, `ep${episodeNumber}-dialogue-voice.mp3`);

    let audioResult;
    if (CONFIG.tts.provider === 'elevenlabs') {
      // Use ElevenLabs
      const ElevenLabsAudioGenerator = (await import('./lib/elevenlabs-audio-generator.js')).default;
      const generator = new ElevenLabsAudioGenerator({
        apiKey: CONFIG.tts.elevenlabs.apiKey,
        voiceIds: {
          HYZER: CONFIG.tts.elevenlabs.hyzerVoice,
          ANNIE: CONFIG.tts.elevenlabs.annieVoice
        }
      });

      audioResult = await generator.generateDialogueAudio(dialogue, voiceAudioPath, CONFIG.output.tempDir);
    } else {
      // Use Google TTS (fallback)
      audioResult = await generateDialogueAudio({
        dialogue,
        outputPath: voiceAudioPath,
        credentialsPath: CONFIG.tts.google.credentialsPath,
        voices: {
          HYZER: { name: 'en-US-Neural2-J', gender: 'MALE' },
          ANNIE: { name: 'en-US-Neural2-F', gender: 'FEMALE' }
        },
        tempDir: CONFIG.output.tempDir
      });
    }

    console.log(`✓ Audio generated: ${voiceAudioPath}\n`);

    if (audioResult.totalCharacters) {
      console.log(`📊 ElevenLabs Usage: ${audioResult.totalCharacters}/10,000 (${audioResult.percentageUsed}%)\n`);
    }

    // STEP 7: Mix with intro/outro
    console.log('🎵 Step 7/9: Mixing with intro/outro music...\n');

    const finalAudioPath = path.join(CONFIG.output.outputDir, `ParSaveables-EP${episodeNumber.toString().padStart(2, '0')}.mp3`);

    const hasIntro = await fs.pathExists(CONFIG.audio.introMusicPath);
    const hasOutro = await fs.pathExists(CONFIG.audio.outroMusicPath);

    if (!hasIntro || !hasOutro) {
      console.warn('⚠️  Music files missing. Using voice-only.');
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

    // STEP 8: Upload to GitHub
    console.log('📤 Step 8/9: Uploading to GitHub Releases...\n');

    // Update log
    await supabase
      .from('podcast_generation_logs')
      .update({ stage: 'upload' })
      .eq('id', logId);

    const uploadResult = await uploadPodcastEpisode({
      token: CONFIG.github.token,
      owner: CONFIG.github.owner,
      repo: CONFIG.github.repo,
      episode: {
        number: episodeNumber,
        title: episodeTitle,
        description: `Episode ${episodeNumber}: ${episodeTitle}\n\nCovering ${incrementalData.totalNewRounds} rounds from ${incrementalData.periodStart} to ${incrementalData.periodEnd}.\n\nThe world of heavy bags, curses, and pocket beers!`,
        type: 'monthly_recap',
        filePath: finalAudioPath,
        fileName: `ParSaveables-EP${episodeNumber.toString().padStart(2, '0')}.mp3`
      }
    });

    console.log(`✓ Upload complete: ${uploadResult.audioUrl}\n`);

    // STEP 9: Update episode record with final data
    console.log('💾 Step 9/9: Finalizing episode...\n');

    await supabase
      .from('podcast_episodes')
      .update({
        audio_url: uploadResult.audioUrl,
        duration_seconds: scriptResult.estimatedMinutes * 60,
        file_size_mb: uploadResult.audioSizeMB,
        event_ids: incrementalData.events?.map(e => e.id) || [],
        published_at: new Date().toISOString(),
        is_published: true
      })
      .eq('id', episode.id);

    // Update log as complete
    const duration = Math.floor((Date.now() - startTime) / 1000);
    await supabase
      .from('podcast_generation_logs')
      .update({
        stage: 'complete',
        success: true,
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        api_costs: {
          claude: scriptResult.costUSD,
          tts: 0, // Free tier
          total: scriptResult.costUSD
        }
      })
      .eq('id', logId);

    console.log('✅ PODCAST GENERATION COMPLETE!\n');
    console.log(`🎵 Episode #${episodeNumber}: ${episode.title}`);
    console.log(`📍 URL: ${uploadResult.audioUrl}`);
    console.log(`📖 Release: ${uploadResult.releaseUrl}`);
    console.log(`⏱️  Duration: ${scriptResult.estimatedMinutes} minutes`);
    console.log(`💰 Total Cost: $${scriptResult.costUSD.toFixed(2)}`);
    console.log(`🕒 Processing Time: ${duration}s\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ GENERATION FAILED:', error.message);
    console.error(error.stack);

    // Log error to database
    try {
      const supabase = createSupabaseClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);
      await supabase
        .from('podcast_generation_logs')
        .insert({
          stage: 'failed',
          success: false,
          error_message: error.message,
          error_details: { stack: error.stack }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    process.exit(1);
  }
}

main();
