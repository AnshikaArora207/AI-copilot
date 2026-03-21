from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import ask_gemini
from services.vectordb import search_pages

router = APIRouter()


class AskRequest(BaseModel):
    question: str
    page_content: str


@router.post("/ask")
def ask(request: AskRequest):
    # Search memory for relevant pages from browsing history
    memory_results = search_pages(request.question, n_results=3)

    answer = ask_gemini(request.question, request.page_content, memory_results)
    return {"answer": answer}
