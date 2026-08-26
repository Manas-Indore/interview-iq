import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from schemas import ExtractedSkills, QuestionSet

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