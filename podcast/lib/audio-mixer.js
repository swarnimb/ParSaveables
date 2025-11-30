/**
 * Audio Mixer - FFmpeg Integration
 * Combines TTS audio with intro/outro music for professional podcast sound
 */

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';

// Set FFmpeg path for Windows
if (process.platform === 'win32') {
  ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
  ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');
}

export class AudioMixer {
  constructor(config = {}) {
    this.config = {
      introMusicPath: config.introMusicPath || './assets/intro-music.mp3',
      outroMusicPath: config.outroMusicPath || './assets/outro-music.mp3',
      introDuration: config.introDuration || 20, // seconds
      outroDuration: config.outroDuration || 15, // seconds
      fadeInDuration: config.fadeInDuration || 2, // seconds
      fadeOutDuration: config.fadeOutDuration || 2, // seconds
      ...config
    };
  }

  /**
   * Mix voice audio with intro/outro music
   * @param {string} voiceAudioPath - Path to TTS-generated voice audio
   * @param {string} outputPath - Path for final mixed podcast
   * @returns {Object} Result with file path and metadata
   */
  async mixPodcast(voiceAudioPath, outputPath) {
    try {
      console.log('🎵 Mixing podcast audio...');

      // Validate input files exist
      await this._validateFiles(voiceAudioPath);

      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputPath));

      // Build FFmpeg filter complex for sophisticated mixing
      const filterComplex = this._buildFilterComplex();

      return await new Promise((resolve, reject) => {
        const startTime = Date.now();

        ffmpeg()
          // Input files
          .input(this.config.introMusicPath)
          .input(voiceAudioPath)
          .input(this.config.outroMusicPath)

          // Complex filter for mixing
          .complexFilter(filterComplex, 'final')

          // Output configuration
          .outputOptions([
            '-map', '[final]',
            '-codec:a', 'libmp3lame',
            '-b:a', '128k', // 128 kbps (good quality, smaller file)
            '-ar', '44100', // 44.1 kHz sample rate
            '-ac', '2' // Stereo
          ])

          // Save to output
          .save(outputPath)

          // Progress logging
          .on('progress', (progress) => {
            if (progress.percent) {
              process.stdout.write(`\r⏳ Progress: ${Math.round(progress.percent)}%`);
            }
          })

          // Success
          .on('end', async () => {
            process.stdout.write('\r'); // Clear progress line
            const mixTime = Date.now() - startTime;

            // Get final file stats
            const stats = await fs.stat(outputPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            // Get audio duration
            const duration = await this._getAudioDuration(outputPath);

            console.log(`✅ Podcast mixed successfully`);
            console.log(`📁 Output: ${outputPath}`);
            console.log(`💾 Size: ${fileSizeMB} MB`);
            console.log(`⏱️  Duration: ${this._formatDuration(duration)}`);
            console.log(`⚡ Mix time: ${(mixTime / 1000).toFixed(1)}s`);

            resolve({
              success: true,
              path: outputPath,
              fileSizeMB: parseFloat(fileSizeMB),
              durationSeconds: duration,
              mixTimeMs: mixTime
            });
          })

          // Error handling
          .on('error', (err) => {
            console.error('\n❌ Mixing failed:', err.message);
            reject(new Error(`Audio mixing failed: ${err.message}`));
          });
      });

    } catch (error) {
      console.error('❌ Mixing setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Build FFmpeg filter complex for audio mixing
   * Creates professional crossfades and volume ducking
   */
  _buildFilterComplex() {
    const {
      introDuration,
      outroDuration,
      fadeInDuration,
      fadeOutDuration
    } = this.config;

    return [
      // [0:a] = intro music
      // Trim intro music to specified duration and fade out
      `[0:a]atrim=0:${introDuration},afade=t=out:st=${introDuration - fadeOutDuration}:d=${fadeOutDuration}[intro]`,

      // [1:a] = voice audio
      // Add fade in at beginning and fade out at end
      `[1:a]afade=t=in:st=0:d=${fadeInDuration},afade=t=out:st=-${fadeOutDuration}:d=${fadeOutDuration}[voice]`,

      // [2:a] = outro music
      // Trim outro music and fade in
      `[2:a]atrim=0:${outroDuration},afade=t=in:st=0:d=${fadeInDuration}[outro]`,

      // Concatenate all three segments
      `[intro][voice][outro]concat=n=3:v=0:a=1[final]`
    ];
  }

  /**
   * Alternative: Mix with music bed (background music during voice)
   * Use this for a more radio-style feel
   */
  async mixWithMusicBed(voiceAudioPath, musicBedPath, outputPath) {
    try {
      console.log('🎵 Mixing podcast with background music...');

      return await new Promise((resolve, reject) => {
        ffmpeg()
          .input(voiceAudioPath)
          .input(musicBedPath)

          // Mix voice (100%) with music bed (20% volume)
          .complexFilter([
            '[1:a]volume=0.2[music]', // Reduce music to 20% (background)
            '[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[final]'
          ])

          .outputOptions([
            '-map', '[final]',
            '-codec:a', 'libmp3lame',
            '-b:a', '128k'
          ])

          .save(outputPath)

          .on('end', async () => {
            const stats = await fs.stat(outputPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            console.log(`✅ Music bed mix complete: ${fileSizeMB} MB`);

            resolve({
              success: true,
              path: outputPath,
              fileSizeMB: parseFloat(fileSizeMB)
            });
          })

          .on('error', (err) => {
            console.error('❌ Music bed mixing failed:', err.message);
            reject(new Error(`Music bed mixing failed: ${err.message}`));
          });
      });

    } catch (error) {
      console.error('❌ Music bed setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Mix with intro fade: intro fades 100% -> 0% over 10s, voice starts at 8s
   */
  async simpleConcatenate(voiceAudioPath, outputPath) {
    try {
      const introDuration = this.config.introDuration || 15;
      const fadeDuration = Math.min(10, introDuration); // Fade over 10s or less if intro is shorter

      console.log(`🎵 Mixing with intro fade (${introDuration}s intro, fade over ${fadeDuration}s)...`);

      return await new Promise((resolve, reject) => {
        ffmpeg()
          .input(this.config.introMusicPath)  // [0]
          .input(voiceAudioPath)              // [1]
          .input(this.config.outroMusicPath)  // [2]

          .complexFilter([
            // Trim intro to specified duration and fade from 100% to 0%
            `[0:a]atrim=0:${introDuration},afade=t=out:st=0:d=${fadeDuration}[intro_faded]`,

            // Delay voice by 8 seconds
            '[1:a]adelay=8000|8000[voice_delayed]',

            // Mix intro (faded) with voice (delayed)
            '[intro_faded][voice_delayed]amix=inputs=2:duration=longest[main_audio]',

            // Concatenate with outro
            '[main_audio][2:a]concat=n=2:v=0:a=1[final]'
          ])

          .outputOptions([
            '-map', '[final]',
            '-codec:a', 'libmp3lame',
            '-b:a', '128k'
          ])

          .save(outputPath)

          .on('end', async () => {
            const stats = await fs.stat(outputPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            console.log(`✅ Mixing complete: ${fileSizeMB} MB`);

            resolve({
              success: true,
              path: outputPath,
              fileSizeMB: parseFloat(fileSizeMB)
            });
          })

          .on('error', (err) => {
            reject(new Error(`Mixing failed: ${err.message}`));
          });
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate required files exist
   */
  async _validateFiles(voiceAudioPath) {
    const files = [
      { path: this.config.introMusicPath, name: 'Intro music' },
      { path: this.config.outroMusicPath, name: 'Outro music' },
      { path: voiceAudioPath, name: 'Voice audio' }
    ];

    for (const file of files) {
      if (!await fs.pathExists(file.path)) {
        throw new Error(`${file.name} not found: ${file.path}`);
      }
    }
  }

  /**
   * Get audio duration using ffprobe
   */
  async _getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(Math.round(metadata.format.duration));
        }
      });
    });
  }

  /**
   * Format duration as MM:SS
   */
  _formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Normalize audio volume (useful if intro/outro are too quiet/loud)
   */
  async normalizeVolume(inputPath, outputPath, targetLUFS = -16) {
    try {
      console.log(`🔊 Normalizing audio to ${targetLUFS} LUFS...`);

      return await new Promise((resolve, reject) => {
        ffmpeg()
          .input(inputPath)
          .audioFilters([
            `loudnorm=I=${targetLUFS}:TP=-1.5:LRA=11`
          ])
          .outputOptions([
            '-codec:a', 'libmp3lame',
            '-b:a', '128k'
          ])
          .save(outputPath)
          .on('end', () => {
            console.log('✅ Volume normalized');
            resolve({ success: true, path: outputPath });
          })
          .on('error', (err) => {
            reject(new Error(`Volume normalization failed: ${err.message}`));
          });
      });

    } catch (error) {
      throw error;
    }
  }
}

/**
 * Helper: Check if FFmpeg is installed
 */
export async function checkFFmpegInstalled() {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        console.error('❌ FFmpeg not found. Please install FFmpeg:');
        console.error('   Windows: choco install ffmpeg');
        console.error('   Mac: brew install ffmpeg');
        console.error('   Linux: apt-get install ffmpeg');
        resolve(false);
      } else {
        console.log('✅ FFmpeg is installed');
        resolve(true);
      }
    });
  });
}

/**
 * Helper: Create silent audio file (useful for padding)
 */
export async function createSilence(durationSeconds, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input('anullsrc=r=44100:cl=stereo')
      .inputFormat('lavfi')
      .duration(durationSeconds)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .save(outputPath)
      .on('end', () => resolve({ success: true, path: outputPath }))
      .on('error', (err) => reject(err));
  });
}
