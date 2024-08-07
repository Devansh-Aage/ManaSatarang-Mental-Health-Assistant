import os
import tensorflow as tf
from flask import Flask, request, jsonify, render_template
from PIL import Image
from flask_cors import CORS
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.vgg16 import preprocess_input
from ultralytics import YOLO
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from dotenv import load_dotenv
import requests
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Initialize YOLO model
yolo_model = YOLO('../YoLo-Weights/yolov8l.pt')
class_names = yolo_model.module.names if hasattr(yolo_model, 'module') else yolo_model.names

# Initialize TensorFlow model
classifier_model = tf.keras.models.load_model('multi_activity_classifier_vgg16.h5')

valid_activities = ['go_to_a_dog_park', 'listen_to_music', 'read_a_book', 'ride_a_bicycle', 'watch_a_sunrise_or_sunset']

# Fetch API key from environment variable
api_key = os.getenv('GENAI_API_KEY')
if not api_key:
    raise ValueError("API key not found. Please set your API key in the .env file.")

# Initialize LangChain model
llm = ChatGoogleGenerativeAI(model="gemini-pro", api_key=api_key)

template = """Predict the single, most dominant emotion conveyed by the following sentence without any description or additional information.
    Sentence: "{text}"
    """
prompt = PromptTemplate.from_template(template)
llm_chain = LLMChain(llm=llm, prompt=prompt)

# Firebase setup
cred = credentials.Certificate("./config/firebase-config.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize Gemini API
# GENAI_API_KEY = "AIzaSyBpyZIpak-ZWttvc2dTZYi2ZONycC_HoO0"
# firebase_admin.initialize_app(cred)
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 2000,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
    system_instruction=(
        "Recommend strictly 5 therapists. Just give email. Nothing else"
    ),
)
chat_session = model.start_chat(history=[])

# Helper functions
def classify_emotion(text):
    response = llm_chain.run({"text": text})
    return response.strip()

def generate_recommendations(user_description, therapists):
    response = chat_session.send_message(f"Based on the following description: '{user_description}', recommend 5 therapists from the list below:\n\n{therapists}\n")
    recommendations = response.text

    # Parse the response to extract therapist details
    recommended_therapists = []
    for line in recommendations.splitlines():
        if line.strip():  # Make sure line is not empty
            recommended_therapists.append(line.strip())

    return recommended_therapists

# Routes for activity verification and classification
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    if 'activity' not in request.form:
        return jsonify({'error': 'No activity provided'}), 400

    image_file = request.files['image']
    activity = request.form['activity'].strip().lower()
    
    if activity not in valid_activities:
        return jsonify({'error': f'Invalid activity. Valid activities are {valid_activities}'}), 400

    image_path = os.path.join('temp', image_file.filename)
    image_file.save(image_path)

    image = Image.open(image_path)
    results = yolo_model(image)

    detected = False
    if activity == 'ride_a_bicycle':
        for result in results:
            for box in result.boxes:
                cls = int(box.cls[0])
                if class_names[cls] == 'bicycle':
                    detected = True
                    break
    elif activity == 'read_a_book':
        for result in results:
            for box in result.boxes:
                cls = int(box.cls[0])
                if class_names[cls] == 'book':
                    detected = True
                    break
    elif activity == 'go_to_a_dog_park':
        for result in results:
            for box in result.boxes:
                cls = int(box.cls[0])
                if class_names[cls] == 'dog':
                    detected = True
                    break

    if not detected and activity in ['ride_a_bicycle', 'read_a_book', 'go_to_a_dog_park']:
        os.remove(image_path)
        return jsonify({'activity': activity, 'result': 'not verified (no relevant object detected)'}), 400

    image = image.resize((224, 224))
    image = img_to_array(image)
    image = preprocess_input(image)
    image = tf.expand_dims(image, axis=0)

    predictions = classifier_model.predict(image)
    predicted_class = valid_activities[predictions.argmax()]

    result = 'verified' if predicted_class == activity else 'not verified'

    os.remove(image_path)

    return jsonify({'activity': activity, 'result': result})

# Routes for emotion classification
@app.route('/classify-emotion', methods=['POST'])
def classify_emotion_route():
    data = request.json
    if 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    try:
        emotion = classify_emotion(data['text'])
        return jsonify({"emotion": emotion}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/emotion', methods=['GET', 'POST'])
def emotion_index():
    emotion = None
    error_message = None
    if request.method == 'POST':
        sentence = request.form.get('sentence')
        if sentence:
            try:
                emotion = classify_emotion(sentence)
            except Exception as e:
                error_message = f"Error: {e}"
        else:
            error_message = "Please enter a sentence."
    return render_template('index.html', emotion=emotion, error_message=error_message)

# Routes for therapist recommendation
@app.route('/recommend', methods=['POST'])
def recommend_therapists():
    user_data = request.json
    user_id = user_data.get('uid')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    # Make a request to the /chat endpoint to get the user description
    chat_api_url = "http://localhost:5000/chat"
    chat_response = requests.post(chat_api_url, json={"user_input": "Provide a brief description of the user", "uid": user_id})

    if chat_response.status_code != 200:
        return jsonify({'error': 'Failed to get user description from chat API'}), chat_response.status_code

    chat_response_data = chat_response.json()
    user_description = chat_response_data.get('response')

    if not user_description:
        return jsonify({'error': 'Description is required'}), 400

    # Fetch therapist data from Firebase
    therapists_ref = db.collection('therapists')
    therapists = therapists_ref.stream()
    
    therapist_list = []
    for therapist in therapists:
        therapist_data = therapist.to_dict()
        therapist_list.append(f"Name: {therapist_data['name']}, Specialization: {therapist_data['specialization']}, Location: {therapist_data['location']}, Bio: {therapist_data['bio']}, Email: {therapist_data['email']}")

    # Generate recommendations based on user description
    recommendations = generate_recommendations(user_description, therapist_list)

    return jsonify(recommendations)

if __name__ == '__main__':
    if not os.path.exists('temp'):
        os.makedirs('temp')
    app.run(debug=True, port=5050)
