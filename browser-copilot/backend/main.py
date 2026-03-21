from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ask import router as ask_router

app = FastAPI(title="Browser Copilot API")

# Allow requests from Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ask_router)

@app.get("/health")
def health():
    return {"status": "ok"}
