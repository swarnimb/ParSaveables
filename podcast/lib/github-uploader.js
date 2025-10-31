/**
 * GitHub Uploader Module
 * Uploads podcast MP3 files to GitHub releases for free hosting
 *
 * ParSaveables - Chain Reactions Podcast
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs-extra';
import path from 'path';

/**
 * Initialize GitHub API client
 * @param {string} token - GitHub personal access token
 * @returns {Octokit} GitHub API client
 */
export function createGitHubClient(token) {
  return new Octokit({
    auth: token
  });
}

/**
 * Create a GitHub release for a podcast episode
 * @param {Octokit} octokit - GitHub client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {object} releaseData - Release metadata
 * @param {string} releaseData.tagName - Git tag (e.g., 'v1.0-episode-1')
 * @param {string} releaseData.name - Release name
 * @param {string} releaseData.description - Release description
 * @param {boolean} [releaseData.draft=false] - Is draft release
 * @param {boolean} [releaseData.prerelease=false] - Is prerelease
 * @returns {Promise<object>} Created release data
 */
export async function createRelease(octokit, owner, repo, releaseData) {
  console.log(`Creating GitHub release: ${releaseData.name}`);

  try {
    // Check if release with this tag already exists
    try {
      const { data: existing } = await octokit.repos.getReleaseByTag({
        owner,
        repo,
        tag: releaseData.tagName
      });

      console.log(`Release already exists with tag ${releaseData.tagName}`);
      return existing;
    } catch (error) {
      // Release doesn't exist, create it
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create the release
    const { data: release } = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: releaseData.tagName,
      name: releaseData.name,
      body: releaseData.description || '',
      draft: releaseData.draft || false,
      prerelease: releaseData.prerelease || false,
      target_commitish: 'main' // Branch to create tag from
    });

    console.log(`✓ Release created: ${release.html_url}`);
    return release;

  } catch (error) {
    console.error(`Error creating release:`, error.message);
    throw new Error(`Failed to create GitHub release: ${error.message}`);
  }
}

/**
 * Upload MP3 file to GitHub release
 * @param {Octokit} octokit - GitHub client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} releaseId - GitHub release ID
 * @param {string} filePath - Path to MP3 file
 * @param {string} [fileName] - Custom file name (defaults to basename)
 * @returns {Promise<object>} Uploaded asset data with URL
 */
export async function uploadAudioFile(octokit, owner, repo, releaseId, filePath, fileName = null) {
  console.log(`Uploading audio file to GitHub release...`);

  try {
    // Validate file exists
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeMB} MB`);

    // Check file size (GitHub has 2GB limit, but warn for large files)
    if (stats.size > 100 * 1024 * 1024) { // 100 MB
      console.warn(`⚠ Large file detected (${fileSizeMB} MB). Upload may take a while.`);
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);
    const name = fileName || path.basename(filePath);

    // Upload to release
    const { data: asset } = await octokit.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: releaseId,
      name: name,
      data: fileBuffer,
      headers: {
        'content-type': 'audio/mpeg',
        'content-length': stats.size
      }
    });

    console.log(`✓ Audio uploaded: ${asset.name}`);
    console.log(`✓ Download URL: ${asset.browser_download_url}`);

    return {
      id: asset.id,
      name: asset.name,
      size: stats.size,
      sizeMB: parseFloat(fileSizeMB),
      url: asset.browser_download_url,
      createdAt: asset.created_at
    };

  } catch (error) {
    console.error(`Error uploading audio file:`, error.message);
    throw new Error(`Failed to upload audio to GitHub: ${error.message}`);
  }
}

/**
 * Upload podcast episode to GitHub (create release + upload file)
 * @param {object} config - Configuration
 * @param {string} config.token - GitHub token
 * @param {string} config.owner - Repository owner
 * @param {string} config.repo - Repository name
 * @param {object} config.episode - Episode metadata
 * @param {number} config.episode.number - Episode number
 * @param {string} config.episode.title - Episode title
 * @param {string} config.episode.description - Episode description
 * @param {string} config.episode.type - Episode type (season_recap, monthly_recap, etc.)
 * @param {string} config.episode.filePath - Path to MP3 file
 * @param {string} [config.episode.fileName] - Custom file name
 * @returns {Promise<object>} Upload result with URL
 */
export async function uploadPodcastEpisode(config) {
  console.log(`\n📤 Uploading podcast episode ${config.episode.number}...`);

  try {
    // Initialize GitHub client
    const octokit = createGitHubClient(config.token);

    // Generate tag name
    const tagName = `podcast-ep${config.episode.number}`;

    // Create release
    const release = await createRelease(octokit, config.owner, config.repo, {
      tagName: tagName,
      name: `🎙️ Chain Reactions - Episode ${config.episode.number}: ${config.episode.title}`,
      description: config.episode.description,
      draft: false,
      prerelease: false
    });

    // Upload audio file
    const asset = await uploadAudioFile(
      octokit,
      config.owner,
      config.repo,
      release.id,
      config.episode.filePath,
      config.episode.fileName
    );

    console.log(`\n✅ Episode ${config.episode.number} uploaded successfully!`);
    console.log(`📍 Release URL: ${release.html_url}`);
    console.log(`🎵 Audio URL: ${asset.url}`);

    return {
      success: true,
      releaseId: release.id,
      releaseUrl: release.html_url,
      tagName: release.tag_name,
      audioUrl: asset.url,
      audioSizeMB: asset.sizeMB,
      uploadedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`\n❌ Upload failed:`, error.message);
    throw error;
  }
}

/**
 * Delete a GitHub release (for cleanup or re-upload)
 * @param {Octokit} octokit - GitHub client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} tagName - Release tag to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteRelease(octokit, owner, repo, tagName) {
  console.log(`Deleting release: ${tagName}`);

  try {
    // Get release by tag
    const { data: release } = await octokit.repos.getReleaseByTag({
      owner,
      repo,
      tag: tagName
    });

    // Delete the release
    await octokit.repos.deleteRelease({
      owner,
      repo,
      release_id: release.id
    });

    // Delete the tag
    await octokit.git.deleteRef({
      owner,
      repo,
      ref: `tags/${tagName}`
    });

    console.log(`✓ Release deleted: ${tagName}`);
    return true;

  } catch (error) {
    if (error.status === 404) {
      console.log(`Release not found: ${tagName}`);
      return false;
    }
    console.error(`Error deleting release:`, error.message);
    throw error;
  }
}

/**
 * List all podcast episode releases
 * @param {Octokit} octokit - GitHub client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} List of podcast releases
 */
export async function listPodcastReleases(octokit, owner, repo) {
  console.log(`Fetching podcast releases...`);

  try {
    const { data: releases } = await octokit.repos.listReleases({
      owner,
      repo,
      per_page: 100
    });

    // Filter to podcast episodes only
    const podcastReleases = releases.filter(r => r.tag_name.startsWith('podcast-ep'));

    console.log(`Found ${podcastReleases.length} podcast releases`);

    return podcastReleases.map(release => ({
      id: release.id,
      tagName: release.tag_name,
      name: release.name,
      description: release.body,
      url: release.html_url,
      createdAt: release.created_at,
      assets: release.assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        size: asset.size,
        downloadUrl: asset.browser_download_url
      }))
    }));

  } catch (error) {
    console.error(`Error listing releases:`, error.message);
    throw error;
  }
}

/**
 * Helper: Get audio duration from MP3 file metadata
 * @param {string} filePath - Path to MP3 file
 * @returns {Promise<number>} Duration in seconds
 */
export async function getAudioDuration(filePath) {
  // This is a placeholder - actual implementation would use ffprobe
  // For now, estimate based on file size (rough approximation)
  const stats = await fs.stat(filePath);
  const fileSizeMB = stats.size / (1024 * 1024);

  // Rough estimate: 1 MB ≈ 60 seconds for 128kbps MP3
  const estimatedDuration = Math.round(fileSizeMB * 60);

  console.log(`Estimated audio duration: ${Math.floor(estimatedDuration / 60)}:${String(estimatedDuration % 60).padStart(2, '0')}`);

  return estimatedDuration;
}

/**
 * Helper: Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "5.23 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
  createGitHubClient,
  createRelease,
  uploadAudioFile,
  uploadPodcastEpisode,
  deleteRelease,
  listPodcastReleases,
  getAudioDuration,
  formatFileSize
};
