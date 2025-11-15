@echo off
REM Wikipedia vs Grokipedia Analysis - Quick Start Script (Windows)

echo 🚀 Starting Wikipedia vs Grokipedia Analysis System
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Check for .env file
if not exist ".env" (
    echo ⚠️  Warning: .env file not found!
    echo 📝 Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚡ Please edit .env and add your API keys before running the app
    echo.
)

REM Run the application
echo ✅ Starting Flask application...
echo 🌐 Dashboard will be available at: http://localhost:5000
echo.
python app.py

pause
