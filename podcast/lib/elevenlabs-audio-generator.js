/**
 * ElevenLabs Audio Generator - Par Saveables Podcast
 * Generates human-like audio with ElevenLabs TTS API
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

export async function generateDialogueAudioElevenLabs(options) {
  const {
    dialogue, // Array of {speaker, text}
    outputPath,
    apiKey,
    voices: providedVoices,
    tempDir = './temp'
  } = options;

  // Use string voice IDs from environment variables
  const voices = {
    HYZER: process.env.ELEVENLABS_HYZER_VOICE || 'pNInz6obpgDQGcFmaJgB', // Adam
    ANNIE: process.env.ELEVENLABS_ANNIE_VOICE || '21m00Tcm4TlvDq8ikWAM'  // Rachel
  };

  console.log(`Generating dialogue audio with ElevenLabs...`);
  console.log(`Using voices: Hyzer=${voices.HYZER}, Annie=${voices.ANNIE}`);

  await fs.ensureDir(tempDir);

  // Initialize ElevenLabs client
  const elevenlabs = new ElevenLabsClient({ apiKey });

  // Character tracking
  let totalCharacters = 0;
  const characterLimit = 10000; // Free tier limit

  // Progress tracking
  const progressFile = path.join(tempDir, 'elevenlabs-progress.json');
  const completedSegments = await loadProgress(progressFile);
  const segmentPaths = [];

  console.log(`\nGenerating ${dialogue.length} segments...`);

  for (let i = 0; i < dialogue.length; i++) {
    const segment = dialogue[i];
    const segmentId = `segment-${i.toString().padStart(3, '0')}-${segment.speaker}`;
    const segmentPath = path.join(tempDir, `${segmentId}.mp3`);

    // Skip if already completed
    if (completedSegments[segmentId]) {
      console.log(`  [${i+1}/${dialogue.length}] ✓ Cached: ${segment.speaker}`);
      segmentPaths.push(segmentPath);
      totalCharacters += segment.text.length;
      continue;
    }

    const voiceId = voices[segment.speaker];
    if (!voiceId) {
      console.warn(`Unknown speaker: ${segment.speaker}, skipping`);
      continue;
    }

    // Character count for this segment
    const segmentCharCount = segment.text.length;
    totalCharacters += segmentCharCount;

    // Warning if approaching limit
    if (totalCharacters > characterLimit * 0.8) {
      console.warn(`⚠️  Warning: ${totalCharacters}/${characterLimit} characters used (${Math.round(totalCharacters/characterLimit*100)}%)`);
    }
    if (totalCharacters > characterLimit) {
      throw new Error(`ElevenLabs character limit exceeded! Used ${totalCharacters}/${characterLimit} characters. Consider using Google TTS fallback.`);
    }

    console.log(`  [${i+1}/${dialogue.length}] ${segment.speaker}: ${segment.text.substring(0, 50)}... (${segmentCharCount} chars)`);

    // Generate audio with retry logic
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const audio = await elevenlabs.textToSpeech.convert(voiceId, {
          text: segment.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,        // 0-1: Lower = more variable/expressive
            similarity_boost: 0.75, // 0-1: Higher = closer to original voice
            style: 0.5,            // 0-1: Exaggeration of speaking style
            use_speaker_boost: true
          }
        });

        // Convert stream to buffer and save
        const chunks = [];
        for await (const chunk of audio) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(segmentPath, buffer);

        // Mark as completed
        completedSegments[segmentId] = true;
        await saveProgress(progressFile, completedSegments);

        segmentPaths.push(segmentPath);
        success = true;

      } catch (error) {
        retries--;
        console.error(`  ❌ Error (${3 - retries}/3): ${error.message}`);
        if (retries === 0) {
          throw new Error(`Failed to generate segment ${i} after 3 attempts: ${error.message}`);
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.log(`\n✓ Generated ${segmentPaths.length} audio segments`);
  console.log(`📊 Total characters used: ${totalCharacters}/${characterLimit} (${Math.round(totalCharacters/characterLimit*100)}%)`);
  console.log(`💡 Remaining: ${characterLimit - totalCharacters} characters (~${Math.round((characterLimit - totalCharacters) / (totalCharacters / dialogue.length) * dialogue.length / dialogue.length)} segments)`);

  // Concatenate all segments
  console.log('Concatenating segments...');
  await concatenateAudioSegments(segmentPaths, outputPath);

  console.log(`✓ Dialogue audio complete: ${outputPath}\n`);

  // Cleanup temp files and progress
  for (const segmentPath of segmentPaths) {
    await fs.remove(segmentPath);
  }
  await fs.remove(progressFile);

  return {
    outputPath,
    segmentCount: segmentPaths.length,
    totalCharacters,
    charactersRemaining: characterLimit - totalCharacters,
    percentageUsed: Math.round(totalCharacters/characterLimit*100),
    speakers: {
      HYZER: dialogue.filter(d => d.speaker === 'HYZER').length,
      ANNIE: dialogue.filter(d => d.speaker === 'ANNIE').length
    }
  };
}

async function concatenateAudioSegments(segmentPaths, outputPath) {
  return new Promise((resolve, reject) => {
    // Create concat file for FFmpeg with absolute paths
    const tempDir = path.dirname(segmentPaths[0]);
    const concatListPath = path.join(tempDir, 'concat-list.txt');
    const concatContent = segmentPaths.map(p => `file '${path.resolve(p)}'`).join('\n');
    fs.writeFileSync(concatListPath, concatContent);

    // Find FFmpeg
    const ffmpegPath = process.platform === 'win32'
      ? 'C:\\ffmpeg\\bin\\ffmpeg.exe'
      : 'ffmpeg';

    // Concatenate using FFmpeg
    const ffmpeg = spawn(ffmpegPath, [
      '-f', 'concat',
      '-safe', '0',
      '-i', path.resolve(concatListPath),
      '-c', 'copy',
      '-y',
      path.resolve(outputPath)
    ]);

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      fs.removeSync(concatListPath);

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg concatenation failed: ${stderr}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
}

async function loadProgress(progressFile) {
  try {
    if (await fs.pathExists(progressFile)) {
      return await fs.readJson(progressFile);
    }
  } catch (error) {
    console.warn(`Could not load progress file: ${error.message}`);
  }
  return {};
}

async function saveProgress(progressFile, completedSegments) {
  try {
    await fs.writeJson(progressFile, completedSegments);
  } catch (error) {
    console.warn(`Could not save progress: ${error.message}`);
  }
}
