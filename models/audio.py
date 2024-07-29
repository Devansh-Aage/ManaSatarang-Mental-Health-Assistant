from flask import Flask, request, jsonify
import os
import numpy as np
import librosa
from sklearn.preprocessing import OneHotEncoder
from keras.models import load_model
import speech_recognition as sr
import joblib

app = Flask(__name__)

model = load_model('model.h5')

labels = ['angry', 'happy', 'sad', 'neutral', 'surprise', 'disgust', 'fear']
encoder = OneHotEncoder()
enc = encoder.fit(np.array(labels).reshape(-1, 1))

def extract_mfcc(filename):
    y, sr = librosa.load(filename, sr=None)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return mfcc.T

def transcribe_audio(filename):
    recognizer = sr.Recognizer()
    audio_file = sr.AudioFile(filename)
    with audio_file as source:
        audio = recognizer.record(source)
    transcription = recognizer.recognize_google(audio)
    return transcription

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
        mfcc_features = extract_mfcc(audio_path)
        
        # Predict emotion
        mfcc_features = np.expand_dims(mfcc_features, axis=(0, -1))  # Reshape for model input
        emotion_prediction = model.predict(mfcc_features)
        emotion_label = enc.inverse_transform(emotion_prediction)[0][0]
        
        # Transcribe audio
        transcription = transcribe_audio(audio_path)
        
        return jsonify({
            "emotion": emotion_label,
            "transcription": transcription
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('./uploads'):
        os.mkdir('./uploads')
    app.run(port=3036)
