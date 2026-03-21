import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def ask_gemini(question: str, page_content: str) -> str:
    trimmed_content = page_content[:8000]

    prompt = f"""You are a helpful AI assistant embedded in a browser extension.

The user is currently viewing a webpage with the following content:
---
{trimmed_content}
---

Answer the user's question based on the page content above.
If the answer is not in the page content, say so clearly and answer from your general knowledge if relevant.
Keep your answer concise and clear.

User question: {question}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content
