import os
import json

from fastapi import FastAPI, HTTPException, UploadFile, File
import uuid
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import base64
import json


# =========================
# ENVIRONMENT
# =========================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not configured in .env"
    )

client = Groq(api_key=GROQ_API_KEY)

# =========================
# FILE STORAGE
# =========================

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
}

# =========================
# FASTAPI
# =========================

app = FastAPI(
    title="LearnTrace AI Backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# REQUEST MODEL
# =========================

class EvaluationRequest(BaseModel):
    question: str
    expected_answer: str
    student_answer: str
    rubric: str = ""
    concept: str = ""
    max_marks: int


# =========================
# BASIC ROUTES
# =========================

@app.get("/")
def root():
    return {
        "message": "LearnTrace AI Backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LearnTrace AI Backend"
    }

# =========================
# ANSWER KEY UPLOAD
# =========================

@app.post("/api/upload-answer-key")
async def upload_answer_key(
    file: UploadFile = File(...)
):
    # Check the file extension
    original_filename = file.filename or "answer_key"
    extension = Path(original_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, WEBP, and PDF files are allowed."
        )

    # Check the declared content type
    allowed_content_types = {
        ".jpg": {"image/jpeg"},
        ".jpeg": {"image/jpeg"},
        ".png": {"image/png"},
        ".webp": {"image/webp"},
        ".pdf": {"application/pdf"},
    }

    if file.content_type not in allowed_content_types[extension]:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file type does not match its extension."
        )

    # Generate a safe, unique filename
    upload_id = str(uuid.uuid4())
    stored_filename = f"{upload_id}{extension}"
    file_path = UPLOAD_DIR / stored_filename

    total_size = 0

    try:
        with file_path.open("wb") as destination:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File is too large. Maximum size is 10 MB."
                    )

                destination.write(chunk)

    except HTTPException:
        file_path.unlink(missing_ok=True)
        raise

    except Exception:
        file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=500,
            detail="Could not save the uploaded file."
        )

    finally:
        await file.close()

    return {
        "success": True,
        "upload_id": upload_id,
        "filename": original_filename,
        "content_type": file.content_type,
        "size": total_size,
        "message": "Answer key uploaded successfully."
    }

# =========================
# AI EVALUATION
# =========================

@app.post("/api/evaluate")
def evaluate_answer(request: EvaluationRequest):

    # -------------------------
    # INPUT VALIDATION
    # -------------------------

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    if not request.expected_answer.strip():
        raise HTTPException(
            status_code=400,
            detail="Expected answer cannot be empty."
        )

    if request.max_marks <= 0:
        raise HTTPException(
            status_code=400,
            detail="Maximum marks must be greater than zero."
        )

    # -------------------------
    # EMPTY ANSWER HANDLING
    # -------------------------

    if not request.student_answer.strip():
        return {
            "success": True,
            "evaluation": {
                "score": 0,
                "maxScore": request.max_marks,
                "confidence": 100,
                "concept": request.concept or "General",
                "mastery": 0,
                "status": "Needs Improvement",
                "understood": [],
                "missing": [
                    "Question was not attempted."
                ],
                "mistakes": [
                    "No answer was provided."
                ],
                "feedback": "No answer was provided.",
                "correction": request.expected_answer
            }
        }
    {
  "question": "What is an array in Java?",
  "expected_answer": "An array is a fixed-size collection that stores multiple values of the same data type.",
  "student_answer": "An array is used to store multiple values of the same data type.",
  "rubric": "Award marks for identifying that an array stores multiple values of the same data type.",
  "concept": "",
  "max_marks": 2
}
    
    # -------------------------
    # CALL GROQ
    # -------------------------

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a fair educational evaluator. "
                        "Evaluate answers accurately and return "
                        "only valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content

        if not content:
            raise HTTPException(
                status_code=502,
                detail="The AI returned an empty response."
            )

        evaluation = json.loads(content)

        # -------------------------
        # VALIDATE AI RESPONSE
        # -------------------------

        required_fields = {
            "score",
            "maxScore",
            "confidence",
            "concept",
            "mastery",
            "status",
            "understood",
            "missing",
            "mistakes",
            "feedback",
            "correction",
        }

        if not isinstance(evaluation, dict):
            raise ValueError("AI response must be a JSON object.")

        if not required_fields.issubset(evaluation.keys()):
            raise ValueError("AI response is missing required fields.")

        score = float(evaluation["score"])

        if not 0 <= score <= request.max_marks:
            raise ValueError("AI returned an invalid score.")

        # Use the teacher's actual maximum marks.
        evaluation["score"] = score
        evaluation["maxScore"] = request.max_marks

        # Ensure percentage values stay within valid bounds.
        evaluation["confidence"] = max(
            0, min(100, float(evaluation["confidence"]))
        )

        evaluation["mastery"] = max(
            0, min(100, float(evaluation["mastery"]))
        )

        # Calculate mastery from the awarded score.
        evaluation["mastery"] = round(
            (score / request.max_marks) * 100
        )

        # Keep the response structure consistent.
        for field in ["understood", "missing", "mistakes"]:
            if not isinstance(evaluation[field], list):
                raise ValueError(
                    f"AI returned an invalid {field} field."
                )

        return {
            "success": True,
            "evaluation": evaluation
        }

    except HTTPException:
        raise

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="AI returned invalid JSON. Please try again."
        )

    except Exception as error:
        print("Answer evaluation error:", error)

        raise HTTPException(
            status_code=502,
            detail="Answer evaluation failed. Please try again."
        )

@app.post("/api/extract-questions")
async def extract_questions(file: UploadFile = File(...)):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WEBP question paper image."
        )

    image_bytes = await file.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image must be 10 MB or less."
        )

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    image_url = (
        f"data:{file.content_type};base64,{encoded_image}"
    )

    prompt = """
    Read this question paper carefully.

    Extract every question and sub-question that students
    are expected to answer.

    Return ONLY a valid JSON object in this format:

    {
      "questions": [
        {
          "type": "objective",
          "question": "An object is placed at the focus of a concave lens. Where is the image formed?",
          "options": [
            "Between F and 2F",
            "At infinity on the same side",
            "At infinity on the other side",
            "Between optical centre and focus"
          ],
          "correctAnswer": "",
          "marks": 1
        },
        {
          "type": "subjective",
          "question": "Name the method by which Plasmodium reproduces. Is this method sexual or asexual?",
          "options": [],
          "correctAnswer": "",
          "marks": 1
        }
      ]
    }

    Rules:
    - Every question must contain these five fields:
      type, question, options, correctAnswer, marks.

    - Identify questions with selectable answer options,
      including MCQs and assertion-reason questions,
      as "objective".

    - Identify questions requiring written answers without
      selectable options as "subjective".

    - For objective questions, extract every option
      separately into the options array.

    - Do not include the answer options inside the question text.

    - For subjective questions, return an empty options array.

    - Set correctAnswer only if the correct answer is
      explicitly provided in the question paper or answer key.

    - If the correct answer is not provided, return "".
      Never guess the correct answer.

    - Preserve the original question wording and option order.

    - Include sub-questions separately when appropriate.

    - Use the marks printed on the paper.
      If marks are not visible, use 0.

    - Do not invent missing text or marks.

    - Do not include instructions as questions.

    - Return valid JSON only. Do not include explanations
      or markdown code fences.
    """

    try:
        completion = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                            },
                        },
                    ],
                }
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )

        result = json.loads(
            completion.choices[0].message.content
        )

        questions = result.get("questions", [])

        if not isinstance(questions, list):
            raise ValueError("Invalid questions format")

        return {
            "success": True,
            "questions": questions,
            "message": "Question paper processed successfully.",
        }

    except Exception as error:
        print("Question extraction error:", error)

        raise HTTPException(
            status_code=500,
            detail="Could not extract questions. Please try another image."
        )