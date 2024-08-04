# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
import google.generativeai as genai

app = Flask(__name__)
CORS(app)


GENAI_API_KEY = "AIzaSyAra4V0IQWR0W0lc82oYNMcyPP0nawwcoI"

cred = credentials.Certificate("./config/firebase-config.json")
initialize_app(cred)
db = firestore.client()
# Initialize Gemini API
genai.configure(api_key=GENAI_API_KEY)
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 2000,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
    system_instruction=(
        "First, ask some questions one by one to categorize the user into the following disorders: 1. Anxiety Disorder, 2. Personality Disorder, 3. ADHD, 4. PTSD, 5. Depression, 6. Bipolar Disorder, or Any other if there.\n"
        "Once categorized, inform the user and provide friendly, cheerful responses. Suggest activities to improve mood.\n"
        "Analyze the user's feelings based on the activity they performed and the summary they provided.\n"
        "Offer insights into their emotions and suggest additional activities they can try to improve their mood.\n"
        "Whenever the user asks for some exercises provide him the needful minimum 5 and in a structured way.\n"
        "Don't Answer to any question which is not related to mental health"
    ),
)

chat_session = model.start_chat(history=[])

def generate_recommendations(user_description, therapists):
    response = chat_session.send_message(f"Based on the following description: '{user_description}', recommend 5 therapists from the list below:\n\n{therapists}\n")
    recommendations = response.text

    # Parse the response to extract therapist details
    recommended_therapists = []
    for line in recommendations.splitlines():
        # Assume that each recommendation is formatted in a specific way
        if line.strip():  # Make sure line is not empty
            recommended_therapists.append(line.strip())

    return recommended_therapists

@app.route('/recommend', methods=['POST'])
def recommend_therapists():
    user_data = request.json
    user_description = user_data.get('description')

    if not user_description:
        return jsonify({'error': 'Description is required'}), 400

    # Fetch therapist data from Firebase
    therapists_ref = db.collection('users')
    therapists = therapists_ref.stream()
    
    therapist_list = []
    for therapist in therapists:
        therapist_data = therapist.to_dict()
        therapist_list.append(f"Name: {therapist_data['name']}, Specialization: {therapist_data['specialization']}, Experience: {therapist_data['experience']}, Location: {therapist_data['location']}, Bio: {therapist_data['bio']}")

    # Generate recommendations based on user description
    recommendations = generate_recommendations(user_description, therapist_list)

    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)
