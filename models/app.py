import os
import torch
import tensorflow as tf
from flask import Flask, request, jsonify, render_template
from PIL import Image
from flask_cors import CORS
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.vgg16 import preprocess_input
from ultralytics import YOLO

# names: {0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane', 5: 'bus', 6: 'train', 7: 'truck', 8: 'boat', 9: 'traffic light', 10: 'fire hydrant', 11: 'stop sign', 12: 'parking meter', 13: 'bench', 14: 'bird', 15: 'cat', 16: 'dog', 17: 'horse', 18: 'sheep', 19: 'cow', 20: 'elephant', 21: 'bear', 22: 'zebra', 23: 'giraffe', 24: 'backpack', 25: 'umbrella', 26: 'handbag', 27: 'tie', 28: 'suitcase', 29: 'frisbee', 30: 'skis', 31: 'snowboard', 32: 'sports ball', 33: 'kite', 34: 'baseball bat', 35: 'baseball glove', 36: 'skateboard', 37: 'surfboard', 38: 'tennis racket', 39: 'bottle', 40: 'wine glass', 41: 'cup', 42: 'fork', 43: 'knife', 44: 'spoon', 45: 'bowl', 46: 'banana', 47: 'apple', 48: 'sandwich', 49: 'purple', 50: 'broccoli', 51: 'carrot', 52: 'hot dog', 53: 'pizza', 54: 'donut', 55: 'cake', 56: 'chair', 57: 'couch', 58: 'potted plant', 59: 'bed', 60: 'dining table', 61: 'toilet', 62: 'tv', 63: 'laptop', 64: 'mouse', 65: 'remote', 66: 'keyboard', 67: 'cell phone', 68: 'microwave', 69: 'oven', 70: 'toaster', 71: 'sink', 72: 'refrigerator', 73: 'book', 74: 'clock', 75: 'vase', 76: 'scissors', 77: 'teddy bear', 78: 'hair drier', 79: 'toothbrush'}
# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the trained VGG16 model
classifier_model = tf.keras.models.load_model('multi_activity_classifier_vgg16.h5')

yolo_model = YOLO('../YoLo-Weights/yolov8l.pt')

class_names = yolo_model.module.names if hasattr(yolo_model, 'module') else yolo_model.names

valid_activities = ['go_to_a_dog_park', 'listen_to_music', 'read_a_book', 'ride_a_bicycle', 'watch_a_sunrise_or_sunset']

@app.route('/')
def index():
    print("Hello")
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
    app.run(debug=True,port=8080)
