from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import ask_gemini

router = APIRouter()


class AskRequest(BaseModel):
    question: str
    page_content: str


@router.post("/ask")
def ask(request: AskRequest):
    answer = ask_gemini(request.question, request.page_content)
    return {"answer": answer}
