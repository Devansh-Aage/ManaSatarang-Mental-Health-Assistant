from flask import Flask, request, jsonify
import os
import numpy as np
import librosa
import subprocess
from flask_cors import CORS
from sklearn.preprocessing import OneHotEncoder
from keras.models import load_model
import speech_recognition as sr
import joblib

app = Flask(__name__)
CORS(app)

model = load_model('model.h5')
enc = joblib.load('one_hot_encoder.pkl')

# def extract_mfcc(filename, num_mfcc=30, n_fft=2048, hop_length=512, duration=15, offset=0):
#     y, sr = librosa.load(filename, duration=duration, offset=offset)
#     mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=num_mfcc, n_fft=n_fft, hop_length=hop_length).T, axis=0)
#     return mfcc

def ex_mfcc(filename):
    a,b  = librosa.load(filename, duration=5, offset=0.5)
    mfcc = np.mean(librosa.feature.mfcc(y=a, sr=b, n_mfcc=30).T, axis=0)
    return mfcc

def predict_emotion_from_audio(file_path, model, encoder):
    # mfcc = extract_mfcc(file_path)
    mfcc = ex_mfcc(file_path)
    mfcc = np.expand_dims(mfcc, axis=0)
    mfcc = np.expand_dims(mfcc, axis=-1)
    predictions = model.predict(mfcc)
    predicted_label_index = np.argmax(predictions, axis=1)[0]
    predicted_label = encoder.categories_[0][predicted_label_index]
    return predicted_label

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

def convert_to_wav(input_path, output_path):
    try:
        subprocess.run(['ffmpeg', '-i', input_path, output_path], check=True)
    except subprocess.CalledProcessError as e:
        app.logger.error(f"Error converting audio to WAV using ffmpeg: {e}")
        raise

@app.route('/', methods=['GET'])
def welcome():
    return "Welcome to the Emotion Detection and Transcription App!"

@app.route('/predict', methods=['POST'])
def predict():
    if 'audio' not in request.files:
        return jsonify({"message": "Audio file is required!"}), 400
    
    audio_file = request.files['audio']
    input_audio_path = os.path.join('./uploads', audio_file.filename)
    audio_file.save(input_audio_path)
    
    output_audio_path = input_audio_path.rsplit('.', 1)[0] + '.wav'
    
    try:
        if not audio_file.filename.endswith('.wav'):
            convert_to_wav(input_audio_path, output_audio_path)
        else:
            output_audio_path = input_audio_path

        if not os.path.isfile(output_audio_path):
            raise Exception("File conversion to WAV failed")

        predicted_emotion = predict_emotion_from_audio(output_audio_path, model, enc)
        transcription = transcribe_audio(output_audio_path)
        
        return jsonify({
            "emotion": predicted_emotion,
            "transcription": transcription
        }), 200
    except Exception as e:
        app.logger.error(f"Error in /predict: {e}")
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('./uploads'):
        os.mkdir('./uploads')
    app.run(port=3036)
