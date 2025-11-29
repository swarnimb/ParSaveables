# Royalty-Free Music Sources for Chain Reactions Podcast

This document provides recommendations for downloading free, high-quality intro and outro music for the podcast.

## Requirements

- **Intro Music**: 20 seconds, energetic sports theme
- **Outro Music**: 15 seconds, wrap-up/conclusion style
- **Format**: MP3, 44.1kHz, stereo
- **License**: Royalty-free, no attribution required (preferred)

---

## Recommended Sources

### 1. YouTube Audio Library (Best Option)

**Why:** Completely free, no attribution required, high quality

**How to Download:**
1. Go to: https://studio.youtube.com/channel/UC/music
2. Click "Audio Library" in left sidebar (requires YouTube account)
3. **For Intro - Search:** "sports energetic upbeat"
   - Filter: Genre = "Electronic" or "Rock", Duration = "0-30 seconds"
   - Recommended tracks:
     - "Jingle Punks - Arpent" (Energetic, 0:21)
     - "Jingle Punks - Backbay Lounge" (Upbeat, 0:28)
     - "Audionautix - Winner Winner!" (Sports feel, 0:27)
4. **For Outro - Search:** "conclusion wrap up"
   - Filter: Mood = "Calm" or "Happy", Duration = "0-30 seconds"
   - Recommended tracks:
     - "Jingle Punks - Far the Days Come" (Reflective, 0:18)
     - "Kevin MacLeod - Cheery Monday" (Upbeat closer, 0:20)

**Editing Tip:** Download tracks longer than needed, then trim to exact 20s/15s using Audacity (free)

---

### 2. Pixabay Music

**Why:** No attribution required, diverse selection

**How to Download:**
1. Go to: https://pixabay.com/music/
2. **For Intro - Search:** "sports upbeat 20 seconds"
   - Recommended:
     - "Upbeat Sport" by Music_For_Videos (0:20)
     - "Action Sports" by Lexin_Music (0:25 - trim to 0:20)
3. **For Outro - Search:** "outro conclusion"
   - Recommended:
     - "Simple Outro" by Top-Flow (0:15)
     - "Podcast Outro" by Music_Unlimited (0:18)

**Download:** Click track → "Free Download" → Select "MP3"

---

### 3. Free Music Archive

**Why:** Creative Commons licensed, professional quality

**How to Download:**
1. Go to: https://freemusicarchive.org/
2. Search with filters: Duration (0-30s), Genre (Electronic/Sports)
3. **For Intro:**
   - Search: "energetic sports intro"
   - Look for CC0 (Public Domain) or CC BY (attribution) licenses
4. **For Outro:**
   - Search: "calm conclusion"

**Note:** Some tracks require attribution - check license before use

---

### 4. Incompetech (Kevin MacLeod)

**Why:** Widely used, recognizable quality

**How to Download:**
1. Go to: https://incompetech.com/music/royalty-free/music.html
2. Search by mood: "Exciting" for intro, "Calm" for outro
3. **Recommended Intro:**
   - "Deuces" (Electronic, energetic)
   - "Backbay Lounge" (Upbeat sports feel)
4. **Recommended Outro:**
   - "Feelin Good" (Smooth jazz conclusion)

**License:** Free with attribution (add to podcast description)

---

## Editing Tools (Free)

### Audacity (Recommended)
**Download:** https://www.audacityteam.org/

**How to Trim Audio:**
1. File → Open → Select MP3
2. Select portion you want (20s or 15s)
3. File → Export → Export as MP3
4. Save to `podcast/assets/intro-music.mp3` or `outro-music.mp3`

### Online Tool: Audio Trimmer
**URL:** https://mp3cut.net/
- Upload MP3 → Select start/end time → Download trimmed file

---

## Recommended Workflow

### Option 1: Simple (Voice-Only First)
1. **Skip music for now** - generate voice-only podcast
2. Add music later once you find perfect tracks
3. Re-run mixer with music files

### Option 2: Quick Start (Use Generic Tracks)
1. Download "Winner Winner" (YouTube Audio Library) for intro
2. Download "Cheery Monday" (YouTube Audio Library) for outro
3. Trim both to exact lengths
4. Save to `assets/` folder

### Option 3: Custom (Professional)
1. Search multiple sources for perfect fit
2. Test different combinations
3. Consider hiring composer on Fiverr ($10-30) for custom 20s+15s package

---

## File Placement

After downloading and editing:

```bash
cd podcast
mkdir assets
# Place files:
assets/intro-music.mp3  (20 seconds, energetic)
assets/outro-music.mp3  (15 seconds, conclusion)
```

Update `.env` if using different paths:
```
INTRO_MUSIC_PATH=./assets/intro-music.mp3
OUTRO_MUSIC_PATH=./assets/outro-music.mp3
```

---

## Attribution (If Required)

If using tracks that require attribution, add to podcast description:

```
Music:
- Intro: "Track Name" by Artist Name (License Type)
- Outro: "Track Name" by Artist Name (License Type)

Available at: [URL]
```

Example:
```
Music:
- Intro: "Winner Winner" by Audionautix (YouTube Audio Library)
- Outro: "Cheery Monday" by Kevin MacLeod (Incompetech)
```

---

## Testing Music

Before generating full podcast, test music mixing:

```bash
npm run test:audio
```

This will create a short test clip with your intro/outro music mixed in.

---

## Pro Tips

1. **Volume Matching**: Ensure intro/outro music volume matches voice audio
2. **Fade Effects**: Our mixer automatically adds crossfades for smooth transitions
3. **Genre Consistency**: Use similar genres for intro/outro (both electronic, both jazz, etc.)
4. **Branding**: Once you choose tracks, stick with them for brand consistency
5. **Backup**: Save original long files + trimmed versions

---

## Need Help?

If you can't find suitable tracks:
1. Check the links above (YouTube Audio Library is easiest)
2. Ask in ParSaveables group for recommendations
3. Consider commissioning custom jingles (~$20-50)
4. Start with voice-only and add music later

**Remember:** Great content > perfect music. Focus on podcast quality first!
