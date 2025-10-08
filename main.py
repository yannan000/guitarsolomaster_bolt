from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import yt_dlp
import librosa
import numpy as np
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
import tempfile
import os
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Guitar Transcription API",
    description="Backend API for transcribing YouTube videos to guitar fretboard positions using AI",
    version="1.0.0"
)

# CORS middleware - allow requests from your Bolt frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your specific Bolt domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class TranscriptionRequest(BaseModel):
    url: HttpUrl
    start_time: Optional[int] = 0
    duration: Optional[int] = 30

class Note(BaseModel):
    string: int
    fret: int
    beat: float
    frequency: float
    confidence: float

class TranscriptionResponse(BaseModel):
    video_title: str
    video_artist: str
    notes: List[Note]
    total_notes: int
    duration: float

# Guitar tuning (standard tuning in Hz)
STANDARD_TUNING = {
    1: 329.63,  # E4
    2: 246.94,  # B3
    3: 196.00,  # G3
    4: 146.83,  # D3
    5: 110.00,  # A2
    6: 82.41    # E2
}

def frequency_to_fret_position(frequency: float) -> tuple:
    """
    Convert frequency to guitar string and fret position.
    Returns (string_number, fret_number) or None if out of range.
    """
    if frequency < 80 or frequency > 1000:  # Outside typical guitar range
        return None
    
    best_match = None
    min_frets = float('inf')
    
    for string_num, open_string_freq in STANDARD_TUNING.items():
        # Calculate fret number using the formula: fret = 12 * log2(f/f0)
        fret = round(12 * np.log2(frequency / open_string_freq))
        
        # Check if this fret is playable (0-24 frets)
        if 0 <= fret <= 24:
            # Calculate actual frequency at this fret
            actual_freq = open_string_freq * (2 ** (fret / 12))
            error = abs(frequency - actual_freq)
            
            # Prefer lower frets (easier to play) if error is similar
            if fret < min_frets and error < 10:  # 10 Hz tolerance
                min_frets = fret
                best_match = (string_num, fret)
    
    return best_match

def download_youtube_audio(url: str, start_time: int = 0, duration: int = 30) -> str:
    """
    Download audio from YouTube video and return path to temp file.
    """
    temp_dir = tempfile.mkdtemp()
    output_path = os.path.join(temp_dir, "audio.wav")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
        }],
        'outtmpl': output_path.replace('.wav', ''),
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get('title', 'Unknown')
            video_artist = info.get('uploader', 'Unknown')
            
        # Load audio and trim to specified duration
        audio, sr = librosa.load(output_path, sr=22050, offset=start_time, duration=duration)
        
        # Save trimmed audio
        import soundfile as sf
        sf.write(output_path, audio, sr)
        
        return output_path, video_title, video_artist
    
    except Exception as e:
        logger.error(f"Error downloading YouTube audio: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to download audio: {str(e)}")

def transcribe_audio(audio_path: str) -> List[Note]:
    """
    Transcribe audio file to notes using Basic Pitch model.
    """
    try:
        # Load audio
        audio, sr = librosa.load(audio_path, sr=22050)
        
        # Run Basic Pitch inference
        model_output, midi_data, note_events = predict(
            audio_path,
            ICASSP_2022_MODEL_PATH
        )
        
        notes = []
        
        # Process note events
        for start_time, end_time, pitch, amplitude, pitch_bends in note_events:
            # Convert MIDI pitch to frequency
            frequency = 440 * (2 ** ((pitch - 69) / 12))
            
            # Convert to guitar position
            position = frequency_to_fret_position(frequency)
            
            if position:
                string_num, fret_num = position
                notes.append(Note(
                    string=string_num,
                    fret=fret_num,
                    beat=float(start_time),
                    frequency=float(frequency),
                    confidence=float(amplitude)
                ))
        
        # Sort by time
        notes.sort(key=lambda x: x.beat)
        
        return notes
    
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "Guitar Transcription API is running",
        "version": "1.0.0",
        "endpoints": {
            "transcribe": "/transcribe-youtube",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "guitar-transcription-api",
        "version": "1.0.0"
    }

@app.post("/transcribe-youtube", response_model=TranscriptionResponse)
async def transcribe_youtube(request: TranscriptionRequest):
    """
    Transcribe a YouTube video to guitar notes.
    
    - **url**: YouTube video URL
    - **start_time**: Start time in seconds (default: 0)
    - **duration**: Duration to transcribe in seconds (default: 30, max: 60)
    """
    # Validate duration
    if request.duration > 60:
        raise HTTPException(status_code=400, detail="Duration cannot exceed 60 seconds")
    
    audio_path = None
    
    try:
        logger.info(f"Starting transcription for URL: {request.url}")
        
        # Download audio
        audio_path, video_title, video_artist = download_youtube_audio(
            str(request.url),
            request.start_time,
            request.duration
        )
        
        logger.info(f"Audio downloaded: {video_title}")
        
        # Transcribe
        notes = transcribe_audio(audio_path)
        
        logger.info(f"Transcription complete: {len(notes)} notes found")
        
        return TranscriptionResponse(
            video_title=video_title,
            video_artist=video_artist,
            notes=notes,
            total_notes=len(notes),
            duration=request.duration
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
    finally:
        # Cleanup temp files
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                os.rmdir(os.path.dirname(audio_path))
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
