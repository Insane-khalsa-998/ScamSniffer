from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import requests
import json
import os
from dotenv import load_dotenv  # <-- Add this

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Now get API key from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions" 

@app.route('/analyze', methods=['POST'])
def analyze_email():
    if not GROQ_API_KEY or "your_real_api_key_here" in GROQ_API_KEY:
        return jsonify({
            "status": "error",
            "message": "Missing or placeholder GROQ_API_KEY in .env"
        }), 500

    data = request.get_json()
    email_text = data.get('email')

    if not email_text:
        return jsonify({"status": "error", "message": "No email provided"}), 400

    score = 0
    red_flags = []

    urgency_keywords = ["verify", "urgent", "immediately", "locked", "suspend", "action required"]
    for word in urgency_keywords:
        if word.lower() in email_text.lower():
            score += 20
            red_flags.append(f"⚠️ Urgency keyword found: {word}")

    links = re.findall(r'https?://[^\s<>"]+', email_text)
    if links:
        score += len(links) * 10
        for link in links:
            red_flags.append(f"🔗 Suspicious link detected: {link}")

    score = min(score, 100)

    prompt = f"""
You are a cybersecurity expert. Analyze the following email and determine if it's phishing.
Respond with JSON format:
{{
  "verdict": "YES/NO",
  "reasoning": "short explanation",
  "risk_score": {score}
}}

Email Content:
{email_text[:1000]}
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        ai_response = response.json()

        content = ai_response["choices"][0]["message"]["content"]
        parsed_content = json.loads(content)

        return jsonify({
            "status": "success",
            "risk_score": score,
            "ai_analysis": parsed_content,
            "red_flags": red_flags
        })

    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500

    except Exception as e:
        return jsonify({
            "status": "failed",
            "error": f"Internal error: {str(e)}"
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)