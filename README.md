# Student Skills Exchange Platform

A premium, glassmorphic web application for students to exchange skills, book mentorship sessions, and chat.

**Live Demo:** [https://student-skill-exchange-platform-mu.vercel.app](https://student-skill-exchange-platform-mu.vercel.app)


## Features
- **Smart Matching**: AI-driven skill matching using cosine similarity.
- **Premium UI**: Modern dark mesh-gradient background with glassmorphic components.
- **Real-time Interaction**: Integrated chat requests and session booking.
- **Profile Management**: Detailed user profiles with skill tracking and points system.
- **AI Assistant**: Built-in coding assistant.

## Tech Stack
- **Frontend**: React (CDN), Tailwind CSS, Vanilla CSS.
- **Backend**: Django, Django Rest Framework (DRF).
- **ML Engine**: Scikit-learn for skill matching.

## Getting Started

### Prerequisites
- Python 3.10+
- Modern Browser

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/shaik17malik/Student_Skill_Exchange_Platform.git
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Seed initial data (optional):
   ```bash
   python seed_data.py
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```
7. Open `index.html` in your browser.
