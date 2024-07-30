from flask import Flask, request, jsonify
import os
import datetime
import pickle
import face_recognition

app = Flask(__name__)

db_dir = './db'
if not os.path.exists(db_dir):
    os.mkdir(db_dir)

log_path = './log.txt'

@app.route('/', methods=['GET'])
def welcome():
    return "Welcome to the Face Recognition App!"

@app.route('/register', methods=['POST'])
def register():
    if 'name' not in request.form or 'image' not in request.files:
        return jsonify({"message": "Name and image are required!"}), 400

    name = request.form['name']
    image_file = request.files['image']
    image = face_recognition.load_image_file(image_file)

    try:
        embeddings = face_recognition.face_encodings(image)[0]
        with open(os.path.join(db_dir, '{}.pickle'.format(name)), 'wb') as file:
            pickle.dump(embeddings, file)
        return jsonify({"message": "User registered successfully!"}), 200
    except IndexError:
        return jsonify({"message": "No face detected in the image!"}), 400

@app.route('/login', methods=['POST'])
def login():
    if 'image' not in request.files:
        return jsonify({"message": "Image is required!"}), 400

    image_file = request.files['image']
    image = face_recognition.load_image_file(image_file)

    try:
        input_embeddings = face_recognition.face_encodings(image)[0]
        for file_name in os.listdir(db_dir):
            with open(os.path.join(db_dir, file_name), 'rb') as file:
                db_embeddings = pickle.load(file)
                result = face_recognition.compare_faces([db_embeddings], input_embeddings)
                if result[0]:
                    name = file_name.split('.')[0]
                    with open(log_path, 'a') as log_file:
                        log_file.write('{},{},in\n'.format(name, datetime.datetime.now()))
                    return jsonify({"message": f"Welcome, {name}!"}), 200
        return jsonify({"message": "Unknown user. Please register."}), 401
    except IndexError:
        return jsonify({"message": "No face detected in the image!"}), 400

if __name__ == '__main__':
    app.run(debug=True,port=3035)
