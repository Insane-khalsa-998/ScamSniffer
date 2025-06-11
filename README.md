# 🧠 ScamSniffer – Open-Source Phishing Detector

Detect phishing emails in Gmail/Outlook using AI + rule-based checks.  
Built with Flask, LLMs, and Chrome Extension APIs.

## 🔍 Features

- Scan email content from Gmail/Outlook
- Analyze with multiple free LLMs
- Show risk score and verdict
- Preview links/files safely in sandbox
- Detect suspicious domains, urgency language, and more

## 🚀 How to Use

### Backend (Flask API)

1. **Install Dependencies**
   
   pip install -r backend/requirements.txt

Set Up Environment Variables
Create a .env file in the backend/ directory:

GROQ_API_KEY=your_api_key_here

Run the Server

cd backend
python app.py

Chrome Extension
Load Unpacked Extension
Go to chrome://extensions/.
Enable Developer Mode .
Click Load unpacked and select the extension/ folder.
Scan Emails
Open Gmail/Outlook.
Click the ScamSniffer icon.
Click Scan This Email .
🛠️ Development Setup
Backend
Clone Repository
git clone https://github.com/Insane-khalsa-998/ScamSniffer.git 

Navigate to Backend

cd backend


Install Dependencies

pip install -r requirements.txt

Run Backend

python app.py
Chrome Extension
Open Chrome Extensions Page
Go to chrome://extensions/.
Enable Developer Mode
Check Developer mode in the top-right corner.
Load Unpacked Extension
Click Load unpacked .
Select the extension/ folder.
Test Extension
Open Gmail/Outlook.
Click the ScamSniffer icon.
Scan an email.
🤝 Contributing
See CONTRIBUTING.md for guidelines.

📄 License
MIT License

🌟 Acknowledgments
Built with ❤️ by KillerShark.
Thanks to contributors and users!
🌐 Contact
Email: killerShark@cyberservices.com

