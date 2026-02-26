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
    labels = {
        "shoulder_tilt_deg": {"pt": "Inclinacao dos ombros", "en": "Shoulder tilt", "unit": "deg"},
        "pelvic_tilt_deg": {"pt": "Inclinacao pelvica", "en": "Pelvic tilt", "unit": "deg"},
        "head_protraction_deg": {"pt": "Protracao de cabeca", "en": "Head protraction", "unit": "deg"},
        "head_tilt_deg": {"pt": "Inclinacao da cabeca", "en": "Head tilt", "unit": "deg"},
        "trunk_inclination_deg": {"pt": "Inclinacao de tronco", "en": "Trunk inclination", "unit": "deg"},
        "shoulder_rotation_cm": {"pt": "Rotacao de ombro", "en": "Shoulder rotation", "unit": "cm"},
        "pelvic_rotation_cm": {"pt": "Rotacao pelvica", "en": "Pelvic rotation", "unit": "cm"},
        "shoulder_mid_z_cm": {"pt": "Centro dos ombros (eixo Z)", "en": "Shoulder midpoint (Z axis)", "unit": "cm"},
        "ear_mid_z_cm": {"pt": "Centro das orelhas (eixo Z)", "en": "Ear midpoint (Z axis)", "unit": "cm"},
    }

    lines: list[str] = []
    for key, value in angles.items():
        if value is None:
            continue
        label = labels.get(key)
        if label:
            label_text = label["pt"] if language == "pt" else label["en"]
            unit = label["unit"]
            lines.append(f"- {label_text}: {value} {unit}")
        else:
            lines.append(f"- {key}: {value}")

    return "\n".join(lines).strip()

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
        model="gpt-5-mini",
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
        "detected_view": posture_data.get("detected_view"),
        "detected_deviations": detected_deviations,
        "clinical_analysis": clinical_analysis,
        "angles": posture_data["angles"],
        "landmarks_2d": posture_data["landmarks_2d"],
        "landmarks_3d": posture_data["landmarks_3d"],
    }
