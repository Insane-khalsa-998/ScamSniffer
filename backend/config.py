# config.py

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API key and URL from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions" 

# For debugging
if not GROQ_API_KEY:
    raise ValueError("Missing GROQ_API_KEY in .env file")