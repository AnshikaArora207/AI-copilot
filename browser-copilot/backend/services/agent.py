import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "click_element",
            "description": "Click a button, link, or any clickable element on the page",
            "parameters": {
                "type": "object",
                "properties": {
                    "selector": {
                        "type": "string",
                        "description": "CSS selector of the element to click",
                    },
                    "description": {
                        "type": "string",
                        "description": "Human readable description of what is being clicked",
                    },
                },
                "required": ["selector", "description"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fill_input",
            "description": "Fill a text input, textarea, or search field with a value",
            "parameters": {
                "type": "object",
                "properties": {
                    "selector": {
                        "type": "string",
                        "description": "CSS selector of the input element",
                    },
                    "value": {
                        "type": "string",
                        "description": "The value to type into the input",
                    },
                    "description": {
                        "type": "string",
                        "description": "Human readable description of what is being filled",
                    },
                },
                "required": ["selector", "value", "description"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "press_enter",
            "description": "Press the Enter key on an input field to submit a search or form. Use this instead of clicking a search button when possible.",
            "parameters": {
                "type": "object",
                "properties": {
                    "selector": {
                        "type": "string",
                        "description": "CSS selector of the input field to press Enter on",
                    },
                    "description": {
                        "type": "string",
                        "description": "Human readable description of the action",
                    },
                },
                "required": ["selector", "description"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "scroll_page",
            "description": "Scroll the page up or down",
            "parameters": {
                "type": "object",
                "properties": {
                    "direction": {
                        "type": "string",
                        "enum": ["up", "down"],
                        "description": "Direction to scroll",
                    },
                    "description": {
                        "type": "string",
                        "description": "Human readable description of the scroll action",
                    },
                },
                "required": ["direction", "description"],
            },
        },
    },
]


def run_agent(command: str, dom_structure: dict) -> list:
    dom_summary = f"""
Inputs/Forms: {json.dumps(dom_structure.get('inputs', []), indent=2)}
Buttons: {json.dumps(dom_structure.get('buttons', []), indent=2)}
Links (first 10): {json.dumps(dom_structure.get('links', [])[:10], indent=2)}
"""

    prompt = f"""You are an AI agent that controls a web browser on behalf of the user.

The user wants you to perform this action:
"{command}"

Here are all the interactive elements currently available on the page:
{dom_summary}

Use the provided tools to carry out the requested action step by step.
Choose the most appropriate elements based on their text, type, placeholder, and purpose.
If you cannot find a suitable element for the requested action, respond with a plain text message explaining why - do NOT call any tools."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        tools=TOOLS,
        tool_choice="auto",
    )

    message = response.choices[0].message

    # No tool calls = model returned a text explanation
    if not message.tool_calls:
        return [{"type": "message", "text": message.content}]

    # Convert tool calls to action list
    actions = []
    for tool_call in message.tool_calls:
        args = json.loads(tool_call.function.arguments)
        actions.append({"type": tool_call.function.name, **args})

    return actions
