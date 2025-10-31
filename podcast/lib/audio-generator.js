/**
 * Audio Generator - Google Cloud Text-to-Speech
 * Converts podcast scripts to high-quality audio (FREE - 1M chars/month)
 */

import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs-extra';
import path from 'path';

export class AudioGenerator {
  constructor(config = {}) {
    // Google Cloud TTS client (uses GOOGLE_APPLICATION_CREDENTIALS env var)
    this.client = new textToSpeech.TextToSpeechClient();

    this.config = {
      voiceName: 'en-US-Neural2-J', // Male, energetic voice
      languageCode: 'en-US',
      voiceGender: 'MALE',
      speakingRate: 1.0, // Normal speed
      pitch: 0.0, // Normal pitch
      audioEncoding: 'MP3',
      effectsProfileId: ['headphone-class-device'], // Optimize for headphones
      ...config
    };
  }

  /**
   * Generate audio from script text
   * @param {string} scriptText - The podcast script
   * @param {string} outputPath - Where to save the MP3
   * @returns {Object} Audio metadata (duration, file size, etc.)
   */
  async generateAudio(scriptText, outputPath) {
    try {
      console.log('🎙️  Generating audio with Google Cloud TTS...');
      console.log(`📝 Script length: ${scriptText.length} characters`);

      // Prepare the text-to-speech request
      const request = {
        input: { text: scriptText },
        voice: {
          languageCode: this.config.languageCode,
          name: this.config.voiceName,
          ssmlGender: this.config.voiceGender
        },
        audioConfig: {
          audioEncoding: this.config.audioEncoding,
          speakingRate: this.config.speakingRate,
          pitch: this.config.pitch,
          effectsProfileId: this.config.effectsProfileId
        }
      };

      // Call Google Cloud TTS API
      const startTime = Date.now();
      const [response] = await this.client.synthesizeSpeech(request);
      const generationTime = Date.now() - startTime;

      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputPath));

      // Write the binary audio content to file
      await fs.writeFile(outputPath, response.audioContent, 'binary');

      // Get file stats
      const stats = await fs.stat(outputPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      // Estimate duration (rough approximation: 150 words/min, ~5 chars/word)
      const estimatedWords = scriptText.split(/\s+/).length;
      const estimatedDurationSeconds = Math.ceil((estimatedWords / 150) * 60);

      console.log(`✅ Audio generated successfully`);
      console.log(`📁 File: ${outputPath}`);
      console.log(`💾 Size: ${fileSizeMB} MB`);
      console.log(`⏱️  Estimated duration: ${Math.floor(estimatedDurationSeconds / 60)}:${(estimatedDurationSeconds % 60).toString().padStart(2, '0')}`);
      console.log(`⚡ Generation time: ${(generationTime / 1000).toFixed(1)}s`);

      return {
        success: true,
        path: outputPath,
        fileSizeMB: parseFloat(fileSizeMB),
        durationSeconds: estimatedDurationSeconds,
        generationTimeMs: generationTime,
        characterCount: scriptText.length
      };

    } catch (error) {
      console.error('❌ Audio generation failed:', error.message);
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  /**
   * Generate audio with SSML for advanced control
   * SSML allows fine control over pronunciation, pauses, emphasis, etc.
   */
  async generateAudioWithSSML(ssmlText, outputPath) {
    try {
      console.log('🎙️  Generating audio with SSML...');

      const request = {
        input: { ssml: ssmlText },
        voice: {
          languageCode: this.config.languageCode,
          name: this.config.voiceName,
          ssmlGender: this.config.voiceGender
        },
        audioConfig: {
          audioEncoding: this.config.audioEncoding,
          speakingRate: this.config.speakingRate,
          pitch: this.config.pitch,
          effectsProfileId: this.config.effectsProfileId
        }
      };

      const [response] = await this.client.synthesizeSpeech(request);

      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, response.audioContent, 'binary');

      const stats = await fs.stat(outputPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ SSML audio generated: ${fileSizeMB} MB`);

      return {
        success: true,
        path: outputPath,
        fileSizeMB: parseFloat(fileSizeMB)
      };

    } catch (error) {
      console.error('❌ SSML audio generation failed:', error.message);
      throw new Error(`SSML TTS generation failed: ${error.message}`);
    }
  }

  /**
   * Convert plain text script to SSML for better TTS control
   * Adds pauses, emphasis, and prosody for more natural speech
   */
  convertToSSML(scriptText) {
    let ssml = '<speak>';

    // Split into sections by headers
    const lines = scriptText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        // Add pause for blank lines (paragraph break)
        ssml += '<break time="500ms"/>';
        continue;
      }

      // Section headers get emphasis and longer pause
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const header = trimmed.slice(1, -1);
        ssml += `<break time="800ms"/><emphasis level="strong">${header}</emphasis><break time="500ms"/>`;
        continue;
      }

      // Exclamation points get more excitement
      if (trimmed.includes('!')) {
        const parts = trimmed.split('!');
        for (let i = 0; i < parts.length - 1; i++) {
          ssml += `<prosody rate="105%" pitch="+1st">${parts[i]}!</prosody><break time="300ms"/>`;
        }
        ssml += parts[parts.length - 1];
        continue;
      }

      // Questions get rising intonation
      if (trimmed.endsWith('?')) {
        ssml += `<prosody pitch="+2st">${trimmed}</prosody><break time="400ms"/>`;
        continue;
      }

      // Numbers get slight emphasis
      const withNumbers = trimmed.replace(/\b(\d+(?:\.\d+)?)\b/g, '<emphasis level="moderate">$1</emphasis>');

      // Regular sentence with natural pause
      ssml += `${withNumbers}<break time="350ms"/>`;
    }

    ssml += '</speak>';

    return ssml;
  }

  /**
   * List available voices from Google Cloud TTS
   */
  async listVoices() {
    try {
      const [result] = await this.client.listVoices({});
      const voices = result.voices;

      // Filter for English US voices
      const enUSVoices = voices.filter(v => v.languageCodes.includes('en-US'));

      console.log(`\n🎤 Available English (US) Voices:\n`);

      for (const voice of enUSVoices) {
        console.log(`${voice.name}`);
        console.log(`  Gender: ${voice.ssmlGender}`);
        console.log(`  Type: ${voice.name.includes('Neural') ? 'Neural (High Quality)' : 'Standard'}`);
        console.log(`  Sample Rate: ${voice.naturalSampleRateHertz} Hz\n`);
      }

      return enUSVoices;
    } catch (error) {
      console.error('Failed to list voices:', error.message);
      return [];
    }
  }

  /**
   * Estimate cost for TTS generation
   * Google Cloud TTS: First 1M chars free, then $4 per 1M chars for WaveNet
   */
  estimateCost(characterCount) {
    const FREE_TIER_CHARS = 1000000; // 1 million
    const COST_PER_MILLION_CHARS = 4.00; // Neural/WaveNet voices

    if (characterCount <= FREE_TIER_CHARS) {
      return {
        cost: 0,
        withinFreeTier: true,
        message: 'Within free tier (1M chars/month)'
      };
    }

    const billableChars = characterCount - FREE_TIER_CHARS;
    const cost = (billableChars / 1000000) * COST_PER_MILLION_CHARS;

    return {
      cost: cost.toFixed(4),
      withinFreeTier: false,
      message: `$${cost.toFixed(4)} (${billableChars.toLocaleString()} chars beyond free tier)`
    };
  }
}

/**
 * Helper: Format bytes to human-readable size
 */
export function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper: Validate audio file exists and is not empty
 */
export async function validateAudioFile(filePath) {
  try {
    const stats = await fs.stat(filePath);

    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }

    if (stats.size < 1000) {
      throw new Error('Audio file is suspiciously small (< 1KB)');
    }

    return {
      valid: true,
      size: stats.size,
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}
