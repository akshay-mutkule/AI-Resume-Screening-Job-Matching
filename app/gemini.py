import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List

def get_gemini_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY environment variable is not defined in the workspace secrets index.")
    return key

def call_gemini_json(prompt: str, system_instruction: str, expected_schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Submits a structured JSON request to the Gemini API and parses the returned JSON safely.
    Uses standard library urllib.request for reliable, ultra-fast zero-dependency execution.
    """
    api_key = get_gemini_key()
    
    # We target the robust, standard gemini-1.5-flash or gemini-2.5-flash model
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    # Construct standard schema structure for Google's official endpoint matching the expected response design
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
    
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            res_json = json.loads(res_data)
            
            # Extract standard nested candidate response path
            candidates = res_json.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini generation engine.")
            
            text_out = candidates[0]["content"]["parts"][0]["text"]
            return json.loads(text_out.strip())
            
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"Gemini API HTTP Error: {err_msg}")
        raise RuntimeError(f"Gemini generation failed: {e.code} - {e.reason}")
    except Exception as e:
        print(f"Gemini parsing failure: {str(e)}")
        raise e
