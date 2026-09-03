from fastapi import FastAPI, UploadFile, File, HTTPException
import pdfplumber
import docx
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import pdfplumber
import docx
import io
from llm_service import extract_skills, generate_questions
from schemas import ExtractedSkills
from llm_service import extract_skills, generate_questions, evaluate_answers
from typing import List



app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "OK", "message": "AI service is running"}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    filename = file.filename.lower()

    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    file_bytes = await file.read()

    try:
        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_bytes)
        else:
            extracted_text = extract_text_from_docx(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from resume")

    return {
        "filename": file.filename,
        "extracted_text": extracted_text
    }

class ResumeTextInput(BaseModel):
    resume_text: str


@app.post("/extract-skills")
async def extract_skills_endpoint(payload: ResumeTextInput):
    try:
        result = extract_skills(payload.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")


class GenerateQuestionsInput(BaseModel):
    skills: ExtractedSkills
    num_questions: int = 5


@app.post("/generate-questions")
async def generate_questions_endpoint(payload: GenerateQuestionsInput):
    try:
        result = generate_questions(payload.skills, payload.num_questions)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

class QAPair(BaseModel):
    question: str
    category: str
    difficulty: str
    userAnswer: str

class EvaluateInput(BaseModel):
    qa_pairs: List[QAPair]

@app.post("/evaluate-answers")
async def evaluate_answers_endpoint(payload: EvaluateInput):
    try:
        qa_pairs = [qa.dict() for qa in payload.qa_pairs]
        result = evaluate_answers(qa_pairs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")