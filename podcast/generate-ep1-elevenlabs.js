#!/usr/bin/env node

/**
 * Generate Episode 1 Audio with ElevenLabs
 */

import { parseDialogue } from './lib/dialogue-script-generator.js';
import { generateDialogueAudioElevenLabs } from './lib/elevenlabs-audio-generator.js';
import fs from 'fs-extra';
import 'dotenv/config';

async function main() {
  const scriptPath = './output/Par-Saveables-EP01-Script.txt';
  const script = await fs.readFile(scriptPath, 'utf-8');
  const dialogue = parseDialogue(script);

  console.log('🎤 Converting dialogue to audio with ElevenLabs...');
  console.log(`Generating dialogue audio with ${dialogue.length} segments...\n`);

  const outputPath = './temp/ep1-dialogue-voice-elevenlabs.mp3';

  const result = await generateDialogueAudioElevenLabs({
    dialogue,
    outputPath,
    apiKey: process.env.ELEVENLABS_API_KEY,
    tempDir: './temp'
  });

  console.log(`\n✅ Audio generated: ${outputPath}`);
  console.log(`\n📊 Stats:`);
  console.log(`  - Segments: ${result.segmentCount}`);
  console.log(`  - Characters: ${result.totalCharacters}`);
  console.log(`  - Remaining: ${result.charactersRemaining}`);
  console.log(`  - Usage: ${result.percentageUsed}%`);
  console.log(`  - Hyzer lines: ${result.speakers.HYZER}`);
  console.log(`  - Annie lines: ${result.speakers.ANNIE}`);
}

main().catch(console.error);
