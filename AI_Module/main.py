import pdfplumber
import re
import os
from flask import Flask, request, jsonify
import traceback
from collections import Counter, defaultdict
from datetime import datetime
from typing import List, Dict, Set, Tuple
import hashlib
from fuzzywuzzy import fuzz
from werkzeug.utils import secure_filename
from flask_cors import CORS
import io  # Added to handle file object

# Profession-specific keywords for detection
PROFESSION_KEYWORDS = {
    "Software Engineering": {'software', 'developer', 'engineer', 'programming', 'python', 'java', 'javascript', 'api', 'backend', 'frontend', 'react', 'flask', 'node', 'sql', 'machine learning', 'yolov', 'graphql', 'postman'},
    "Agriculture": {'agriculture', 'farming', 'crop', 'soil', 'irrigation', 'agronomy', 'horticulture', 'pest', 'fertilizer', 'livestock', 'sustainability'},
    "Medicine": {'medicine', 'doctor', 'nurse', 'physician', 'surgery', 'patient', 'clinical', 'healthcare', 'pharmacy', 'diagnostics', 'biology'},
    "Business": {'business', 'management', 'marketing', 'finance', 'sales', 'strategy', 'operations', 'entrepreneur', 'mba', 'accounting', 'procurement', 'supply chain', 'inventory', 'vendor'},
    "Engineering": {'engineering', 'mechanical', 'civil', 'electrical', 'chemical', 'design', 'cad', 'project', 'construction', 'robotics'}
}

# Career path suggestions
CAREER_PATHS = {
    "Software Engineering": ["Software Developer", "Full Stack Engineer", "DevOps Engineer", "Machine Learning Engineer"],
    "Agriculture": ["Agronomist", "Farm Manager", "Agricultural Engineer", "Soil Scientist"],
    "Medicine": ["General Practitioner", "Surgeon", "Nurse Practitioner", "Pharmacist"],
    "Business": ["Business Analyst", "Marketing Manager", "Operations Manager", "Entrepreneur"],
    "Engineering": ["Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "Project Manager"],
    "Unknown": ["General career exploration recommended"]
}

# Section identifiers
SECTION_STARTS = {
    "experience": {'experience', 'work', 'employment', 'professional', 'career'},
    "education": {'education', 'academic', 'qualification', 'studies'},
    "skills": {'skills', 'technical', 'competencies', 'abilities'},
    "projects": {'projects', 'research', 'achievements', 'work'}
}

# General skills applicable across professions
GENERAL_SKILLS = {'communication', 'teamwork', 'leadership', 'problem solving', 'project management', 'research', 'analysis', 'negotiation'}

# --- Utility Functions ---
def extract_text_from_pdf(file_object) -> str:
    """Extract raw text from PDF file object using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_object.read())) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
                else:
                    print(f"No text extracted from page {page.page_number}")
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def get_clean_lines(text: str) -> List[str]:
    """Clean and split text into meaningful lines, removing short noise."""
    lines = [line.strip() for line in text.split('\n') if line.strip() and len(line.strip()) > 5]
    return lines

def generate_hash(content: str) -> str:
    """Generate a unique hash for deduplication."""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

# --- Core Extraction Functions ---
def detect_profession(lines: List[str]) -> Tuple[str, Set[str]]:
    """Detect the dominant profession based on keyword frequency."""
    keyword_counts = Counter()
    for line in lines:
        line_lower = line.lower()
        for profession, keywords in PROFESSION_KEYWORDS.items():
            for keyword in keywords:
                if keyword in line_lower:
                    keyword_counts[profession] += 1
    
    if not keyword_counts:
        return "Unknown", set()
    
    dominant_profession = max(keyword_counts.items(), key=lambda x: x[1])[0]
    dominant_keywords = {k for k in PROFESSION_KEYWORDS[dominant_profession] if any(k in line.lower() for line in lines)}
    return dominant_profession, dominant_keywords

def extract_contact_number(lines: List[str]) -> str:
    """Extract phone number with regex, ensuring no false positives like fax."""
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    for line in lines:
        match = re.search(phone_pattern, line)
        if match and not any(kw in line.lower() for kw in ['fax', 'office']):
            return match.group(0)
    return "Not found"

def extract_email(lines: List[str]) -> str:
    """Extract email address with regex, prioritizing the first valid one."""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    seen = set()
    for line in lines:
        match = re.search(email_pattern, line)
        if match and match.group(0) not in seen:
            seen.add(match.group(0))
            return match.group(0)
    return "Not found"

def extract_experience(lines: List[str]) -> List[str]:
    """Extract experience as a clean list of job titles with optional dates."""
    experience = []
    in_section = False
    job_keywords = {'developer', 'engineer', 'manager', 'analyst', 'consultant', 'architect', 'lead', 'intern', 'officer', 'assistant', 'executive', 'specialist'}
    date_pattern = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}\s*[–-]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present)?\s*(\d{4})?'
    exclude_keywords = {'bachelor', 'master', 'coursework', 'project', 'skills', 'education'}
    seen_hashes = set()

    for i, line in enumerate(lines):
        line_lower = line.lower()
        # Start experience section
        if any(kw in line_lower for kw in SECTION_STARTS["experience"]):
            in_section = True
            continue
        # End experience section
        if in_section and any(kw in line_lower for kw in SECTION_STARTS["education"] | SECTION_STARTS["skills"] | SECTION_STARTS["projects"]):
            in_section = False
            continue
        
        if in_section:
            cleaned_line = ' '.join(line.split())
            line_hash = generate_hash(cleaned_line)
            if (any(kw in line_lower for kw in job_keywords) and 
                not any(exclude in line_lower for exclude in exclude_keywords) and 
                line_hash not in seen_hashes):
                date_match = re.search(date_pattern, line)
                entry = f"{cleaned_line} ({date_match.group(0)})" if date_match else cleaned_line
                experience.append(entry)
                seen_hashes.add(line_hash)
    
    # Fallback: Scan entire document if no section found
    if not experience:
        for i, line in enumerate(lines):
            line_lower = line.lower()
            cleaned_line = ' '.join(line.split())
            line_hash = generate_hash(cleaned_line)
            if (any(kw in line_lower for kw in job_keywords) and 
                not any(exclude in line_lower for exclude in exclude_keywords) and 
                line_hash not in seen_hashes):
                date_match = re.search(date_pattern, line)
                entry = f"{cleaned_line} ({date_match.group(0)})" if date_match else cleaned_line
                experience.append(entry)
                seen_hashes.add(line_hash)
    
    return experience if experience else ["Not found"]

def extract_education(lines: List[str]) -> List[str]:
    """Extract education entries with strict filtering to avoid noise."""
    education = []
    in_section = False
    degree_keywords = {'bsc', 'msc', 'btech', 'mtech', 'phd', 'ba', 'ma', 'mba', 'bs', 'ms', 'bachelor', 'master', 'diploma', 'degree', 'ssc', 'hsc'}
    uni_keywords = {'university', 'college', 'institute', 'school', 'academy'}
    exclude_keywords = {'experience', 'skills', 'project', 'work', 'certification', 'languages'}
    seen_hashes = set()

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(kw in line_lower for kw in SECTION_STARTS["education"]):
            in_section = True
            continue
        if in_section and any(kw in line_lower for kw in exclude_keywords):
            in_section = False
            continue
        
        if in_section:
            cleaned_line = ' '.join(line.split())
            line_hash = generate_hash(cleaned_line)
            if (any(kw in line_lower for kw in degree_keywords | uni_keywords) and 
                len(cleaned_line.split()) > 2 and 
                line_hash not in seen_hashes and 
                fuzz.ratio(cleaned_line.lower(), "contact") < 70):  # Avoid contact info
                education.append(cleaned_line)
                seen_hashes.add(line_hash)
    
    # Fallback
    if not education:
        for line in lines:
            line_lower = line.lower()
            cleaned_line = ' '.join(line.split())
            line_hash = generate_hash(cleaned_line)
            if (any(kw in line_lower for kw in degree_keywords | uni_keywords) and 
                len(cleaned_line.split()) > 2 and 
                line_hash not in seen_hashes and 
                fuzz.ratio(cleaned_line.lower(), "contact") < 70):
                education.append(cleaned_line)
                seen_hashes.add(line_hash)
    
    return education if education else ["Not found"]

def extract_skills(lines: List[str], profession_keywords: Set[str]) -> List[str]:
    """Extract top 5 skills with frequency-based ranking and fuzzy matching."""
    skills_count = Counter()
    all_skills = profession_keywords | GENERAL_SKILLS

    for line in lines:
        line_lower = line.lower()
        for skill in all_skills:
            if skill in line_lower or fuzz.ratio(skill, line_lower) > 80:  # Fuzzy match for typos
                skills_count[skill] = skills_count.get(skill, 0) + 1
    
    top_skills = [skill for skill, _ in skills_count.most_common(5)]
    return top_skills if top_skills else ["Not found"]

def extract_projects(lines: List[str]) -> List[str]:
    """Extract projects with multi-line support and strict deduplication."""
    projects = []
    in_section = False
    action_keywords = {'developed', 'built', 'created', 'designed', 'implemented', 'researched', 'analyzed', 'conducted', 'managed'}
    exclude_keywords = {'education', 'skills', 'experience', 'certification', 'languages'}
    seen_hashes = set()

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(kw in line_lower for kw in SECTION_STARTS["projects"]):
            in_section = True
            continue
        if in_section and any(kw in line_lower for kw in exclude_keywords):
            in_section = False
            continue
        
        if in_section:
            cleaned_line = ' '.join(line.split())
            line_hash = generate_hash(cleaned_line)
            if any(kw in line_lower for kw in action_keywords) and line_hash not in seen_hashes:
                if i + 1 < len(lines) and not any(kw in lines[i + 1].lower() for kw in exclude_keywords):
                    cleaned_line += " " + ' '.join(lines[i + 1].split())
                projects.append(cleaned_line)
                seen_hashes.add(line_hash)
    
    # Fallback
    if not projects:
        for i, line in enumerate(lines):
            line_lower = line.lower()
            cleaned_line = ' '.join(line.split())
            line_hash = generate_hash(cleaned_line)
            if any(kw in line_lower for kw in action_keywords) and line_hash not in seen_hashes:
                if i + 1 < len(lines) and not any(kw in lines[i + 1].lower() for kw in exclude_keywords):
                    cleaned_line += " " + ' '.join(lines[i + 1].split())
                projects.append(cleaned_line)
                seen_hashes.add(line_hash)
    
    return projects if projects else ["Not found"]

# --- Main Processing Function ---
def process_cv(file_object) -> Dict:
    """Process the CV file object and return a clean, deduplicated result."""
    text = extract_text_from_pdf(file_object)
    if not text:
        print("No text extracted from PDF")
        return {
            "contact_number": "Not found",
            "email": "Not found",
            "experience": ["Not found"],
            "education": ["Not found"],
            "skills": ["Not found"],
            "projects": ["Not found"],
            "detected_profession": "Unknown",
            "suggested_career_paths": ["General career exploration recommended"]
        }
    
    lines = get_clean_lines(text)
    profession, profession_keywords = detect_profession(lines)
    
    result = {
        "contact_number": extract_contact_number(lines),
        "email": extract_email(lines),
        "experience": extract_experience(lines),
        "education": extract_education(lines),
        "skills": extract_skills(lines, profession_keywords),
        "projects": extract_projects(lines),
        "detected_profession": profession,
        "suggested_career_paths": CAREER_PATHS.get(profession, ["General career exploration recommended"])
    }
    print(f"Extracted data: {result}")  # Debugging log
    return result

# --- Flask API Setup ---
app = Flask(__name__)
CORS(app, resources={
    r"/extract_cv": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/extract_cv', methods=['POST'])
def extract_cv():
    try:
        if 'cv' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        cv_file = request.files['cv']
        if not cv_file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files allowed"}), 400

        # Process the file object directly
        result = process_cv(cv_file)
        
        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except Exception as e:
        print(f"Error in extract_cv: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")  # Detailed error logging
        return jsonify({
            "error": str(e),
            "trace": traceback.format_exc()
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "CV Processor",
        "timestamp": datetime.now().isoformat()
    }), 200

if __name__ == "__main__":
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)