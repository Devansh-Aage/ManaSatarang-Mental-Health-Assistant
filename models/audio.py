import pandas as pd
import numpy as np
import os
import librosa
import joblib
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from keras.models import Sequential
from keras.layers import Dense, LSTM, Dropout, BatchNormalization
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping
from tensorflow.keras.models import load_model
import speech_recognition as sr

# Load the pre-trained model
model = load_model('model.h5')

# Function to transcribe audio
def transcribe_audio(filename):
    recognizer = sr.Recognizer()
    audio_file = sr.AudioFile(filename)
    with audio_file as source:
        audio = recognizer.record(source)
    transcription = recognizer.recognize_google(audio)
    return transcription

# Path to the audio file you want to test
test_audio_path = '/content/drive/MyDrive/Kumail2 (1) (1).wav'

# Extract MFCC features from the test audio file
mfcc_features = extract_mfcc(test_audio_path)

# Predict emotion
mfcc_features = np.expand_dims(mfcc_features, axis=(0, -1))  # Reshape for model input
emotion_prediction = model.predict(mfcc_features)
emotion_label = enc.inverse_transform(emotion_prediction)[0][0]

# Transcribe audio
transcription = transcribe_audio(test_audio_path)

# Display results
print("Emotion Detected:", emotion_label)
print("Transcription:", transcription)