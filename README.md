# 🎸 Guitar Transcription API

Backend API for transcribing YouTube videos to guitar fretboard positions using AI.

## 🚀 Features

- **YouTube Audio Extraction**: Download and process audio from any YouTube video
- **AI-Powered Transcription**: Uses Spotify's Basic Pitch model for accurate note detection
- **Guitar Mapping**: Automatically converts frequencies to guitar string/fret positions
- **RESTful API**: Easy integration with any frontend
- **CORS Enabled**: Works seamlessly with web applications

## 📋 API Endpoints

### `GET /`
Health check endpoint
```json
{
  "status": "Guitar Transcription API is running",
  "version": "1.0.0"
}
```

### `POST /transcribe-youtube`
Transcribe a YouTube video to guitar notes

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "start_time": 0,
  "duration": 30
}
```

**Response:**
```json
{
  "video_title": "Song Title",
  "video_artist": "Artist Name",
  "notes": [
    {
      "string": 1,
      "fret": 5,
      "beat": 0.5,
      "frequency": 440.0,
      "confidence": 0.95
    }
  ],
  "total_notes": 42,
  "duration": 30.0
}
```

## 🛠️ Local Development

### Prerequisites
- Python 3.9+
- FFmpeg (for audio processing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yannan000/guitar-transcription-api.git
cd guitar-transcription-api
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

4. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## 🌐 Deployment

### Deploy to Railway

1. **Sign up for Railway**: https://railway.app
2. **Connect GitHub**: Login with GitHub and authorize Railway
3. **Create New Project**: 
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
4. **Configure**:
   - Railway auto-detects Python and installs dependencies
   - FFmpeg is automatically available
5. **Generate Domain**:
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Your API will be live at: `https://your-app.up.railway.app`

### Environment Variables

No environment variables required for basic operation. Optional:
- `PORT`: Server port (default: 8000)

## 📝 Usage Example

### Python
```python
import requests

response = requests.post(
    "https://your-api-url.up.railway.app/transcribe-youtube",
    json={
        "url": "https://www.youtube.com/watch?v=qJB9k7eTa-g",
        "start_time": 0,
        "duration": 30
    }
)

data = response.json()
print(f"Found {data['total_notes']} notes")
for note in data['notes']:
    print(f"String {note['string']}, Fret {note['fret']} at {note['beat']}s")
```

### JavaScript (Frontend)
```javascript
const response = await fetch('https://your-api-url.up.railway.app/transcribe-youtube', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://www.youtube.com/watch?v=qJB9k7eTa-g',
    start_time: 0,
    duration: 30
  })
});

const data = await response.json();
console.log(`Found ${data.total_notes} notes`);
```

## 🎯 How It Works

1. **Audio Extraction**: Downloads audio from YouTube using yt-dlp
2. **Preprocessing**: Converts to WAV format and trims to specified duration
3. **AI Transcription**: Uses Basic Pitch (Spotify's ML model) to detect notes
4. **Frequency Mapping**: Converts detected frequencies to guitar positions
5. **Optimization**: Selects the most playable string/fret combination

## 🎵 Guitar Mapping

Standard tuning (E-A-D-G-B-E):
- String 1 (E4): 329.63 Hz
- String 2 (B3): 246.94 Hz
- String 3 (G3): 196.00 Hz
- String 4 (D3): 146.83 Hz
- String 5 (A2): 110.00 Hz
- String 6 (E2): 82.41 Hz

The algorithm prefers lower frets (easier to play) when multiple positions are possible.

## ⚠️ Limitations

- Maximum transcription duration: 60 seconds
- Accuracy depends on audio quality and complexity
- Works best with single-note melodies
- Chords may be transcribed as individual notes

## 📄 License

MIT License - feel free to use for educational purposes.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 🐛 Troubleshooting

### "Failed to download audio"
- Check that the YouTube URL is valid and accessible
- Ensure the video is not age-restricted or private

### "Transcription failed"
- Verify FFmpeg is installed correctly
- Check that the audio file is not corrupted

### CORS errors
- Ensure your frontend domain is allowed in the CORS middleware
- For production, update `allow_origins` in `main.py`

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using FastAPI, Basic Pitch, and yt-dlp
