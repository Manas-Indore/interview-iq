from fastapi import FastAPI, UploadFile, File, HTTPException
import pdfplumber
import docx
import io

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