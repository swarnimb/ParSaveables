#!/usr/bin/env node

/**
 * Episode 1 Custom Audio Mixer
 *
 * INTRO (15 seconds total):
 * - 0-10s: Intro music at 100% volume
 * - 10-15s: Fade intro music from 100% to 0%
 * - 13s: Start dialogue (overlapping with fade)
 *
 * OUTRO:
 * - Last 5s of dialogue: Fade in outro music from 0% to 100%
 * - After dialogue: 10 more seconds of outro music
 *   - 0-3s: 100% volume
 *   - 3-10s: Fade from 100% to 0%
 */

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set FFmpeg path
if (process.platform === 'win32') {
  ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
  ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');
}

const INTRO_MUSIC = path.join(__dirname, 'assets', 'intro-music.mp3');
const OUTRO_MUSIC = path.join(__dirname, 'assets', 'outro-music.mp3');
const DIALOGUE = path.join(__dirname, 'temp', 'ep1-dialogue-voice-elevenlabs.mp3');
const OUTPUT = path.join(__dirname, 'output', 'ParSaveables-EP01-ElevenLabs.mp3');

async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

async function mixAudio() {
  console.log('🎵 Mixing Episode 1 with custom intro/outro...\n');

  // Get dialogue duration
  const dialogueDuration = await getAudioDuration(DIALOGUE);
  console.log(`✓ Dialogue duration: ${dialogueDuration.toFixed(2)}s`);

  // Calculate timings
  const introStart = 0;
  const introFullVolEnd = 10;
  const introFadeStart = 10;
  const introFadeEnd = 15;
  const dialogueStart = 13;

  const outroFadeInStart = dialogueDuration - 5;
  const outroFadeInEnd = dialogueDuration;
  const outroFullVolDuration = 3;
  const outroFadeOutDuration = 7;
  const totalOutroDuration = 10;

  console.log(`\n📊 Timeline:`);
  console.log(`  Intro: 0-${introFadeEnd}s (full volume 0-${introFullVolEnd}s, fade ${introFadeStart}-${introFadeEnd}s)`);
  console.log(`  Dialogue: ${dialogueStart}s-${dialogueDuration + dialogueStart}s`);
  console.log(`  Outro fade in: ${outroFadeInStart + dialogueStart}s-${outroFadeInEnd + dialogueStart}s`);
  console.log(`  Outro: ${dialogueDuration + dialogueStart}s-${dialogueDuration + dialogueStart + totalOutroDuration}s\n`);

  // Complex filter for precise audio mixing
  const complexFilter = [
    // [0] = intro music, [1] = dialogue, [2] = outro music

    // INTRO: Trim to 15 seconds, fade out last 5 seconds
    `[0:a]atrim=0:${introFadeEnd},afade=t=out:st=${introFadeStart}:d=5[intro]`,

    // DIALOGUE: Delay by 13 seconds to start at the right time
    `[1:a]adelay=${dialogueStart * 1000}|${dialogueStart * 1000}[dialogue]`,

    // OUTRO: Fade in over 5 seconds, then fade out last 7 seconds
    `[2:a]atrim=0:${totalOutroDuration},afade=t=in:st=0:d=5,afade=t=out:st=${outroFullVolDuration}:d=${outroFadeOutDuration}[outro_faded]`,

    // Delay outro to start 5 seconds before dialogue ends
    `[outro_faded]adelay=${(dialogueStart + outroFadeInStart) * 1000}|${(dialogueStart + outroFadeInStart) * 1000}[outro]`,

    // Mix all three tracks
    `[intro][dialogue][outro]amix=inputs=3:duration=longest:normalize=0[out]`
  ];

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(INTRO_MUSIC)
      .input(DIALOGUE)
      .input(OUTRO_MUSIC)
      .complexFilter(complexFilter, 'out')
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .on('start', (cmd) => {
        console.log('🎬 FFmpeg command:', cmd);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\r⏳ Progress: ${progress.percent.toFixed(1)}%`);
        }
      })
      .on('end', () => {
        console.log('\n\n✅ Episode 1 complete!');
        console.log(`📍 Output: ${OUTPUT}\n`);
        resolve();
      })
      .on('error', (err) => {
        console.error('\n❌ Error:', err.message);
        reject(err);
      })
      .save(OUTPUT);
  });
}

mixAudio().catch(console.error);
