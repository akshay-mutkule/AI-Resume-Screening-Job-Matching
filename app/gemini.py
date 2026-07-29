import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List

def get_gemini_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key or key in ["MY_GEMINI_API_KEY", "YOUR_GEMINI_API_KEY", "undefined", "null"]:
        return ""
    return key

def call_gemini_json(prompt: str, system_instruction: str, expected_schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Submits a structured JSON request to the Gemini API and parses the returned JSON safely.
    Tries gemini-2.5-flash, gemini-2.0-flash, and gemini-1.5-flash in sequence.
    """
    api_key = get_gemini_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing, empty, or placeholder.")
    
    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    last_err = None

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "systemInstruction": {
            "parts": [
                {
                    "text": system_instruction
                }
            ]
        },
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": expected_schema
        }
    }
    data = json.dumps(payload).encode("utf-8")

    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                res_data = response.read().decode("utf-8")
                res_json = json.loads(res_data)
                
                candidates = res_json.get("candidates", [])
                if not candidates:
                    continue
                
                text_out = candidates[0]["content"]["parts"][0]["text"]
                return json.loads(text_out.strip())
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8")
            print(f"Gemini API HTTP Error with {model_name}: {err_msg}")
            last_err = RuntimeError(f"Gemini generation failed on {model_name}: {e.code} - {e.reason}")
        except Exception as e:
            print(f"Gemini call error with {model_name}: {str(e)}")
            last_err = e

    if last_err:
        raise last_err
    raise RuntimeError("All Gemini models failed to generate content.")

