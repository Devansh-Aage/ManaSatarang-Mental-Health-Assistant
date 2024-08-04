#######Voice Emotion model
from flask import Flask, request, render_template, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from dotenv import load_dotenv
import os
from langchain.chains import StuffDocumentsChain
import speech_recognition as sr
import io

load_dotenv()

app = Flask(__name__)

api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError("API key not found. Please set your API key in the .env file.")

llm = ChatGoogleGenerativeAI(model="gemini-pro", api_key=api_key)

template = """Predict the single, most dominant emotion conveyed by the following sentence without any description or additional information.
Sentence: "{text}"
"""

prompt = PromptTemplate.from_template(template)
llm_chain = LLMChain(llm=llm, prompt=prompt)

class CustomDocument:
    def __init__(self, text, metadata=None):
        self.page_content = text
        self.metadata = metadata if metadata is not None else {}

stuff_chain = StuffDocumentsChain(
    llm_chain=llm_chain,
    document_variable_name="text"
)

def analyze_emotion(text):
    document = CustomDocument(text=text)
    input_data = {"input_documents": [document]}
    response = stuff_chain.invoke(input_data)
    return response.get("output_text", "No output text found")

def convert_speech_to_text(audio_data):
    recognizer = sr.Recognizer()
    with sr.AudioFile(io.BytesIO(audio_data)) as source:
        audio = recognizer.record(source)
        text = recognizer.recognize_google(audio)
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
    try:
        text = convert_speech_to_text(file.read())
        emotion_result = analyze_emotion(text)
        return jsonify({'emotion': emotion_result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


