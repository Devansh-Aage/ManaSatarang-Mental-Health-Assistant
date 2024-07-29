from flask import Flask, render_template, request
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# Retrieve API key from environment variable
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError("API key not found. Please set your API key in the .env file.")

llm = ChatGoogleGenerativeAI(model="gemini-pro", api_key=api_key)

# Define the Emotion Detection Chain
template = """Predict the single, most dominant emotion conveyed by the following sentence without any description or additional information.
    Sentence: "{text}"
    EMOTION:"""

prompt = PromptTemplate.from_template(template)
llm_chain = LLMChain(llm=llm, prompt=prompt)

def classify_emotion(text):
    response = llm_chain.run({"text": text})
    return response.strip()

@app.route('/', methods=['GET', 'POST'])
def index():
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

if __name__ == '__main__':
    app.run(debug=True)
