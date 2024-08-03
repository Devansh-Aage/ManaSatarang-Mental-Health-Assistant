from flask import Flask, request, jsonify
import os
import numpy as np
import librosa
from pydub import AudioSegment
from sklearn.preprocessing import OneHotEncoder
from keras.models import load_model
import speech_recognition as sr
import joblib

app = Flask(__name__)

model = load_model('model.h5')
enc = joblib.load('one_hot_encoder.pkl')

def extract_mfcc(filename, max_pad_len=30, n_mfcc=1):
    try:
        y, sr = librosa.load(filename, sr=None)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
        
        # Padding or truncating the MFCC features to ensure a consistent input shape
        if mfcc.shape[1] > max_pad_len:
            mfcc = mfcc[:, :max_pad_len]
        else:
            pad_width = max_pad_len - mfcc.shape[1]
            mfcc = np.pad(mfcc, pad_width=((0, 0), (0, pad_width)), mode='constant')
        
        return mfcc.T
    except Exception as e:
        app.logger.error(f"Error in extract_mfcc: {e}")
        raise

def transcribe_audio(filename):
    try:
        recognizer = sr.Recognizer()
        audio_file = sr.AudioFile(filename)
        with audio_file as source:
            audio = recognizer.record(source)
        transcription = recognizer.recognize_google(audio)
        return transcription
    except Exception as e:
        app.logger.error(f"Error in transcribe_audio: {e}")
        raise

@app.route('/', methods=['GET'])
def welcome():
    return "Welcome to the Emotion Detection and Transcription App!"

@app.route('/predict', methods=['POST'])
def predict():
    if 'audio' not in request.files:
        return jsonify({"message": "Audio file is required!"}), 400
    
    audio_file = request.files['audio']
    audio_path = os.path.join('./uploads', audio_file.filename)
    audio_file.save(audio_path)
    
    try:
        # Convert audio to WAV format if it's not already
        if not audio_file.filename.endswith('.wav'):
            sound = AudioSegment.from_file(audio_path)
            audio_path = audio_path.rsplit('.', 1)[0] + '.wav'
            sound.export(audio_path, format="wav")
        
        # Check if the file was converted correctly
        if not os.path.isfile(audio_path):
            raise Exception("File conversion to WAV failed")
        
        mfcc_features = extract_mfcc(audio_path)
        
        # Predict emotion
        mfcc_features = np.expand_dims(mfcc_features, axis=0)  # Reshape for model input
        mfcc_features = np.expand_dims(mfcc_features, axis=-1)  # Add channel dimension
        emotion_prediction = model.predict(mfcc_features)
        emotion_label = enc.inverse_transform(emotion_prediction)[0][0]
        
        # Transcribe audio
        transcription = transcribe_audio(audio_path)
        
        return jsonify({
            "emotion": emotion_label,
            "transcription": transcription
        }), 200
    except Exception as e:
        app.logger.error(f"Error in /predict: {e}")
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('./uploads'):
        os.mkdir('./uploads')
    app.run(port=3036)
