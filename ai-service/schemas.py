from pydantic import BaseModel
from typing import List

class ExtractedSkills(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    experience_summary: str
    projects: List[str]

class InterviewQuestion(BaseModel):
    question: str
    category: str  # e.g. "technical", "coding", "behavioral"
    difficulty: str  # "easy", "medium", "hard"

class QuestionSet(BaseModel):
    questions: List[InterviewQuestion]

class AnswerEvaluation(BaseModel):
    score: int  # out of 10
    strengths: str
    improvements: str
    ideal_answer_summary: str


class EvaluationResult(BaseModel):
    evaluations: List[AnswerEvaluation]
    overall_score: int  # out of 10
    overall_feedback: str