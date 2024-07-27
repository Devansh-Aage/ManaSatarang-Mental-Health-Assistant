import os
import torch
import tensorflow as tf
from flask import Flask, request, jsonify, render_template
from PIL import Image
from flask_cors import CORS
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.vgg16 import preprocess_input
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load the trained VGG16 model
classifier_model = tf.keras.models.load_model('multi_activity_classifier_vgg16.h5')

# Load YOLOv5 model
yolo_model = YOLO('../YoLo-Weights/yolov8l.pt')

class_names = yolo_model.module.names if hasattr(yolo_model, 'module') else yolo_model.names

valid_activities = ['go_to_a_dog_park', 'listen_to_music', 'read_a_book', 'ride_a_bicycle', 'watch_a_sunrise_or_sunset']

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

if __name__ == '__main__':
    if not os.path.exists('temp'):
        os.makedirs('temp')
    app.run(debug=True, port=5000)
