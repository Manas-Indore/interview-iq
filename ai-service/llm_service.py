import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from schemas import ExtractedSkills, QuestionSet
from schemas import ExtractedSkills, QuestionSet, EvaluationResult

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.3
)


def extract_skills(resume_text: str) -> ExtractedSkills:
    structured_llm = llm.with_structured_output(ExtractedSkills)

    prompt = ChatPromptTemplate.from_template(
        """You are a resume analysis expert. Extract structured information from this resume text.

Resume:
{resume_text}

Extract technical skills, soft skills, a brief experience summary, and notable projects."""
    )

    chain = prompt | structured_llm
    result = chain.invoke({"resume_text": resume_text})
    return result


def generate_questions(skills: ExtractedSkills, num_questions: int = 5) -> QuestionSet:
    structured_llm = llm.with_structured_output(QuestionSet)

    prompt = ChatPromptTemplate.from_template(
        """You are an expert technical interviewer. Based on this candidate's profile, generate {num_questions} personalized interview questions.

Technical Skills: {technical_skills}
Experience: {experience_summary}
Projects: {projects}

Generate a mix of technical, coding, and behavioral questions appropriate for their skill level. Vary the difficulty."""
    )

    chain = prompt | structured_llm
    result = chain.invoke({
        "num_questions": num_questions,
        "technical_skills": ", ".join(skills.technical_skills),
        "experience_summary": skills.experience_summary,
        "projects": ", ".join(skills.projects)
    })
    return result

def evaluate_answers(qa_pairs: list) -> EvaluationResult:
        structured_llm = llm.with_structured_output(EvaluationResult)

        qa_text = "\n\n".join([
            f"Q{i+1} ({qa['category']}, {qa['difficulty']}): {qa['question']}\nAnswer: {qa['userAnswer'] or '(No answer provided)'}"
            for i, qa in enumerate(qa_pairs)
        ])

        prompt = ChatPromptTemplate.from_template(
            """You are an expert technical interviewer evaluating a candidate's mock interview responses.

    {qa_text}

    For each question, evaluate the answer on a scale of 1-10, note strengths, areas for improvement, and briefly summarize what an ideal answer would include. Then provide an overall score (1-10) and overall feedback summarizing the candidate's performance."""
        )

        chain = prompt | structured_llm
        result = chain.invoke({"qa_text": qa_text})
        return result