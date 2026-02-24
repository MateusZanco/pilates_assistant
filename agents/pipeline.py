from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from openai import OpenAI

from tools.posture_tools import extract_landmarks_and_angles


ROOT_DIR = Path(__file__).resolve().parents[1]
PROMPT_FILE = ROOT_DIR / "prompts" / "postural_analysis_message.txt"


def _angles_text_summary(angles: dict[str, float], language: str) -> str:
    if language == "pt":
        return (
            f"- Inclinação dos ombros: {angles['shoulder_tilt_deg']} graus\n"
            f"- Inclinação pélvica: {angles['pelvic_tilt_deg']} graus\n"
            f"- Protração de cabeça: {angles['head_protraction_deg']} graus\n"
            f"- Inclinação da cabeça: {angles['head_tilt_deg']} graus\n"
            f"- Inclinação de tronco: {angles['trunk_inclination_deg']} graus"
        )

    return (
        f"- Shoulder tilt: {angles['shoulder_tilt_deg']} deg\n"
        f"- Pelvic tilt: {angles['pelvic_tilt_deg']} deg\n"
        f"- Head protraction: {angles['head_protraction_deg']} deg\n"
        f"- Head tilt: {angles['head_tilt_deg']} deg\n"
        f"- Trunk inclination: {angles['trunk_inclination_deg']} deg"
    )


def _load_system_prompt(language: str) -> str:
    if not PROMPT_FILE.exists():
        raise RuntimeError(f"Missing prompt file at {PROMPT_FILE}")

    output_language = "Portuguese (Brazil)" if language == "pt" else "English"
    template = PROMPT_FILE.read_text(encoding="utf-8")
    return template.format(output_language=output_language)


def _openai_json_analysis(angles: dict[str, float], language: str) -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    client = OpenAI(api_key=api_key)
    angles_summary = _angles_text_summary(angles, language)
    system_prompt = _load_system_prompt(language)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": (
                    "Analyze these posture angles and return the JSON object.\n\n"
                    f"Postural angles:\n{angles_summary}"
                ),
            },
        ],
    )

    content = response.choices[0].message.content or "{}"
    parsed = json.loads(content)
    return parsed


def run_postural_pipeline(image_bytes: bytes, language: str = "en") -> dict[str, Any]:
    posture_data = extract_landmarks_and_angles(image_bytes)
    llm_result = _openai_json_analysis(posture_data["angles"], language)

    detected_deviations = llm_result.get("detected_deviations", [])
    if not isinstance(detected_deviations, list):
        detected_deviations = []

    clinical_analysis = llm_result.get("clinical_analysis", "")
    if not isinstance(clinical_analysis, str):
        clinical_analysis = ""

    return {
        "status": "success",
        "detected_deviations": detected_deviations,
        "clinical_analysis": clinical_analysis,
        "angles": posture_data["angles"],
        "landmarks_2d": posture_data["landmarks_2d"],
        "landmarks_3d": posture_data["landmarks_3d"],
    }
