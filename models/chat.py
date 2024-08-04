import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sklearn.feature_extraction.text import TfidfVectorizer
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
import google.generativeai as genai

# Initialize Flask App and Firestore
app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("./config/firebase-config.json")
initialize_app(cred)
db = firestore.client()

# Configuration
DEVELOPER_KEY = "AIzaSyAtlZQExJ-QTrRh-3BZ0NYfPnnBjPQjLdc"
CUSTOM_SEARCH_ENGINE_ID = "52dcf3fb99a344f61"
GENAI_API_KEY = "AIzaSyAra4V0IQWR0W0lc82oYNMcyPP0nawwcoI"

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

TherapistModel = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
    system_instruction=(
        ""
    ),
)

# Initialize chat session and response count
chat_session = model.start_chat(history=[])
response_count = 0
chat_history = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    global response_count

    user_message = request.json["user_input"]
    user_id = request.json["uid"]
    chat_history.append({"user": user_message})

    # Retrieve last 10 journal entries
    journals_ref = db.collection('journals')
    query = journals_ref.where('uid', '==', user_id).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10)
    journals = query.stream()
    journal_entries = []
    for journal in journals:
        journal_data = journal.to_dict()
        journal_entries.append(f"{journal_data['title']}: {journal_data['body']} (Emotion: {journal_data.get('emotion', 'Unknown')})")

    # Include journal entries in the prompt
    journal_context = "\n".join(journal_entries)
    prompt = f"User's last 10 journal entries:\n{journal_context}\n\n{user_message}"
    print(prompt)
    response_count += 1

    response = chat_session.send_message(prompt)
    chat_history.append({"bot": response.text})
    
    youtube_videos = []

    formatted_response = response.text.replace('*', '')

    return jsonify({"response": formatted_response, "youtube_videos": youtube_videos})

@app.route('/recommend', methods=['POST'])
def recommend_therapists():
    user_data = request.json
    user_description = user_data.get('description')

    if not user_description:
        return jsonify({'error': 'Description is required'}), 400

    # Fetch therapist data from Firebase
    therapists_ref = db.collection('therapists')
    therapists = therapists_ref.stream()
    
    therapist_list = []
    for therapist in therapists:
        therapist_data = therapist.to_dict()
        therapist_list.append(f"Name: {therapist_data['name']}, Specialization: {therapist_data['specialization']}, Experience: {therapist_data['experience']}, Location: {therapist_data['location']}, Bio: {therapist_data['bio']}")

    # Generate recommendations based on user description
    recommendations = generate_recommendations(user_description, therapist_list)

    return jsonify(recommendations)

@app.route("/search", methods=["GET"])
def search_articles():
    query = request.args.get("query", "")
    articles = search_google(query, num_results=5)
    return jsonify(articles)

@app.route("/recommendations", methods=["GET"])
def recommendations():
    keywords = extract_keywords(chat_history)
    youtube_videos, articles = fetch_recommendations(keywords)

    return jsonify({"youtube_videos": youtube_videos, "articles": articles})

def search_disorder_videos(response_text):
    disorder_terms = ["anxiety disorder", "personality disorder", "ADHD", "PTSD", "depression", "bipolar disorder"]
    for term in disorder_terms:
        if term in response_text.lower():
            return get_video_details(search_youtube(term, max_results=5))
    return []

def search_custom_youtube(user_message):
    match = re.search(r'"([^"]*)"', user_message)
    if match:
        query = match.group(1)
        return get_video_details(search_youtube(query, max_results=5))
    return []

def extract_keywords(chat_history, num_keywords=10):
    predefined_keywords = [
        "Anxiety Disorder", "Personality Disorder", "ADHD", "PTSD", "Depression", "Bipolar Disorder",
        "Mental Health", "Health", "Breathing Exercises", "Mindfulness", "Meditation", "Activities"
    ]
    chat_text = " ".join(
        message["user"] if "user" in message else message["bot"] for message in chat_history
    ).lower()

    return [keyword for keyword in predefined_keywords if keyword.lower() in chat_text]

def fetch_recommendations(keywords):
    youtube_videos, articles = [], []
    for keyword in keywords:
        youtube_videos.extend(get_video_details(search_youtube(keyword, max_results=4)))
        articles.extend(search_google(keyword, num_results=4))

    return youtube_videos[:10], articles[:10]

def search_youtube(query, max_results=5):
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)
    try:
        search_response = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            maxResults=max_results
        ).execute()
        return [item["id"]["videoId"] for item in search_response["items"]]
    except HttpError as error:
        print(error)
        return []

def get_video_details(video_ids):
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)
    try:
        video_details_response = youtube.videos().list(
            part="snippet",
            id=",".join(video_ids)
        ).execute()
        return [{
            "title": item["snippet"]["title"],
            "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
            "link": f"https://www.youtube.com/watch?v={item['id']}",
            "snippet": item["snippet"]["description"],
            "publishedAt": item["snippet"]["publishedAt"]
        } for item in video_details_response["items"]]
    except HttpError as error:
        print(error)
        return []

def search_google(query, num_results=5):
    try:
        service = build("customsearch", "v1", developerKey=DEVELOPER_KEY)
        res = service.cse().list(
            q=query,
            cx=CUSTOM_SEARCH_ENGINE_ID,
            num=num_results
        ).execute()
        return [{
            "title": item["title"],
            "link": item["link"]
        } for item in res.get("items", [])]
    except HttpError as error:
        print(error)
        return []

def generate_recommendations(user_description, therapists):
    response = TherapistModel.send_message(f"Based on the following description: '{user_description}', recommend 5 therapists from the list below:\n\n{therapists}\n")
    recommendations = response.text

    # Parse the response to extract therapist details
    recommended_therapists = []
    for line in recommendations.splitlines():
        # Assume that each recommendation is formatted in a specific way
        if line.strip():  # Make sure line is not empty
            recommended_therapists.append(line.strip())

    return recommended_therapists


if __name__ == "__main__":
    app.run(debug=True)
