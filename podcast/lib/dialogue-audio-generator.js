/**
 * Dialogue Audio Generator - Par Saveables Podcast
 * Generates audio with two alternating voices (Hyzer & Annie)
 * Supports both Google Cloud TTS and ElevenLabs
 */

import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { generateDialogueAudioElevenLabs } from './elevenlabs-audio-generator.js';

/**
 * Main entry point - routes to appropriate TTS provider
 */
export async function generateDialogueAudio(options) {
  const provider = process.env.TTS_PROVIDER || 'google';

  console.log(`🎙️  Using TTS provider: ${provider.toUpperCase()}\n`);

  if (provider === 'elevenlabs') {
    return await generateDialogueAudioElevenLabs({
      ...options,
      apiKey: process.env.ELEVENLABS_API_KEY
    });
  } else {
    return await generateDialogueAudioGoogle(options);
  }
}

/**
 * Google Cloud TTS implementation (original)
 */
async function generateDialogueAudioGoogle(options) {
  const {
    dialogue, // Array of {speaker, text}
    outputPath,
    credentialsPath,
    voices = {
      HYZER: { name: 'en-US-Neural2-J', gender: 'MALE' },
      ANNIE: { name: 'en-US-Neural2-F', gender: 'FEMALE' }
    },
    tempDir = './temp'
  } = options;

  console.log(`Generating dialogue audio with ${dialogue.length} segments...`);

  await fs.ensureDir(tempDir);

  // Initialize TTS client
  const client = new textToSpeech.TextToSpeechClient({
    keyFilename: credentialsPath
  });

  // Generate audio for each dialogue segment
  const segmentPaths = [];

  for (let i = 0; i < dialogue.length; i++) {
    const segment = dialogue[i];
    const voice = voices[segment.speaker];

    if (!voice) {
      console.warn(`Unknown speaker: ${segment.speaker}, skipping`);
      continue;
    }

    console.log(`  [${i+1}/${dialogue.length}] ${segment.speaker}: ${segment.text.substring(0, 50)}...`);

    const segmentPath = path.join(tempDir, `segment-${i.toString().padStart(3, '0')}-${segment.speaker}.mp3`);

    // Enhance text with SSML for natural intonations
    const ssmlText = enhanceWithSSML(segment.text, segment.speaker);

    // Generate audio for this segment
    const request = {
      input: { ssml: ssmlText },
      voice: {
        languageCode: 'en-US',
        name: voice.name,
        ssmlGender: voice.gender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0, // Let SSML control rate dynamically
        pitch: 0, // Let SSML control pitch dynamically
        volumeGainDb: 0,
        effectsProfileId: ['headphone-class-device']
      }
    };

    const [response] = await client.synthesizeSpeech(request);
    await fs.writeFile(segmentPath, response.audioContent, 'binary');
    segmentPaths.push(segmentPath);
  }

  console.log(`\n✓ Generated ${segmentPaths.length} audio segments`);
  console.log('Concatenating segments...');

  // Concatenate all segments using FFmpeg
  await concatenateAudioSegments(segmentPaths, outputPath);

  console.log(`✓ Dialogue audio complete: ${outputPath}`);

  // Cleanup temp files
  for (const segmentPath of segmentPaths) {
    await fs.remove(segmentPath);
  }

  return {
    outputPath,
    segmentCount: segmentPaths.length,
    speakers: {
      HYZER: dialogue.filter(d => d.speaker === 'HYZER').length,
      ANNIE: dialogue.filter(d => d.speaker === 'ANNIE').length
    }
  };
}

function enhanceWithSSML(text, speaker) {
  // Detect emotional context for dynamic prosody
  const isExcited = /(!|wow|amazing|incredible|insane|awesome)/i.test(text);
  const isDramatic = /\.\.\./.test(text);

  let ssml = '<speak>';

  // Dynamic base prosody based on speaker and emotional context
  let rate = speaker === 'HYZER' ? '100%' : '95%';
  let pitch = speaker === 'HYZER' ? '+1st' : '-1st';

  if (isExcited) {
    rate = speaker === 'HYZER' ? '108%' : '103%';
    pitch = speaker === 'HYZER' ? '+2.5st' : '+0.5st';
  } else if (isDramatic) {
    rate = '92%';
    pitch = speaker === 'HYZER' ? '-0.5st' : '-2st';
  }

  ssml += `<prosody rate="${rate}" pitch="${pitch}">`;

  // Process text with emotional markers - avoid nested prosody
  text = text
    // Dramatic ellipses - long pause
    .replace(/\.\.\./g, '<break time="600ms"/>')

    // Em dashes for dramatic pauses
    .replace(/—/g, '<break time="400ms"/>')
    .replace(/--/g, '<break time="350ms"/>')

    // Exclamations with emphasis and pause
    .replace(/(\w+)!/g, '<emphasis level="strong">$1</emphasis>!')
    .replace(/!+\s/g, '!<break time="300ms"/> ')
    .replace(/!+$/g, '!<break time="250ms"/>')

    // Questions with pause
    .replace(/\?+\s/g, '?<break time="350ms"/> ')
    .replace(/\?+$/g, '?<break time="300ms"/>')

    // Reactions and interjections
    .replace(/\b(wow|whoa|oh man|oh boy|oh no|oof|yikes|dang)\b/gi,
      '<emphasis level="strong">$&</emphasis><break time="250ms"/>')

    // Laughter
    .replace(/\b(haha|hehe|lol)\b/gi, '<emphasis level="strong">$&</emphasis><break time="300ms"/>')

    // Emphatic words
    .replace(/\b(NEVER|ALWAYS|ZERO|BIGGEST|BEST|WORST|INSANE|INCREDIBLE|AMAZING)\b/g,
      '<emphasis level="strong">$&</emphasis>')

    // Numbers with slight emphasis
    .replace(/\b(\d+)\b/g, '<emphasis level="moderate">$1</emphasis>')

    // Player names - moderate emphasis
    .replace(/\b(Hyzer|Annie|Shogun|Jabba the Putt|Jaguar|Bird|Fireball|Cobra|Intern Line Cook|Food Zaddy|Scarlet Speedster|Butter Cookie|Ace Brook|BigBirdie)\b/g,
      '<emphasis level="moderate">$&</emphasis>')

    // Key verbs get slight emphasis
    .replace(/\b(won|dominated|crushed|nailed|finished|scored)\b/gi, '<emphasis level="moderate">$&</emphasis>')

    // Natural breathing pauses
    .replace(/,\s/g, ',<break time="250ms"/> ')
    .replace(/;\s/g, ';<break time="300ms"/> ')

    // Sentence endings
    .replace(/\.\s(?=[A-Z])/g, '.<break time="400ms"/> ')
    .replace(/\.$/, '.<break time="350ms"/>');

  ssml += text;
  ssml += '</prosody></speak>';

  return ssml;
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
      ? 'C:\\ffmpeg\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe'
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
