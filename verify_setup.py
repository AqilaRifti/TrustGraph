#!/usr/bin/env python3
"""
Verification script for Wikipedia vs Grokipedia Analysis System
Checks project structure and configuration
"""

import os
import sys

def check_file(path, description):
    """Check if a file exists"""
    if os.path.exists(path):
        print(f"✓ {description}: {path}")
        return True
    else:
        print(f"✗ {description} missing: {path}")
        return False

def check_directory(path, description):
    """Check if a directory exists"""
    if os.path.isdir(path):
        print(f"✓ {description}: {path}")
        return True
    else:
        print(f"✗ {description} missing: {path}")
        return False

def main():
    print("=" * 60)
    print("Wikipedia vs Grokipedia Analysis - Setup Verification")
    print("=" * 60)
    print()
    
    all_good = True
    
    # Check core files
    print("📄 Core Files:")
    all_good &= check_file("app.py", "Flask application")
    all_good &= check_file("config.py", "Configuration")
    all_good &= check_file("requirements.txt", "Dependencies")
    all_good &= check_file(".env.example", "Environment template")
    all_good &= check_file("README.md", "Documentation")
    print()
    
    # Check backend modules
    print("🔧 Backend Modules:")
    all_good &= check_directory("backend", "Backend directory")
    all_good &= check_file("backend/__init__.py", "Backend package")
    all_good &= check_file("backend/scraper.py", "Content scraper")
    all_good &= check_file("backend/embeddings.py", "Embedding manager")
    all_good &= check_file("backend/comparison.py", "Content comparator")
    all_good &= check_file("backend/cerebras_analyzer.py", "Cerebras analyzer")
    all_good &= check_file("backend/dkg_publisher.py", "DKG publisher")
    print()
    
    # Check data files
    print("📊 Data Files:")
    all_good &= check_directory("data", "Data directory")
    all_good &= check_file("data/__init__.py", "Data package")
    all_good &= check_file("data/api_keys.py", "API key rotator")
    all_good &= check_file("data/topics.json", "Topics list")
    print()
    
    # Check frontend
    print("🎨 Frontend:")
    all_good &= check_directory("templates", "Templates directory")
    all_good &= check_file("templates/base.html", "Base template")
    all_good &= check_file("templates/index.html", "Dashboard")
    all_good &= check_file("templates/comparison.html", "Comparison page")
    all_good &= check_directory("static", "Static directory")
    all_good &= check_directory("static/css", "CSS directory")
    all_good &= check_directory("static/js", "JS directory")
    all_good &= check_file("static/css/style.css", "Stylesheet")
    all_good &= check_file("static/js/script.js", "JavaScript")
    print()
    
    # Check startup scripts
    print("🚀 Startup Scripts:")
    all_good &= check_file("run.sh", "Linux/Mac startup")
    all_good &= check_file("run.bat", "Windows startup")
    print()
    
    # Summary
    print("=" * 60)
    if all_good:
        print("✅ All files present! Project structure is complete.")
        print()
        print("Next steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Configure .env file with your API keys")
        print("3. Run: python app.py")
        print("4. Open: http://localhost:5000")
        return 0
    else:
        print("❌ Some files are missing. Please check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
