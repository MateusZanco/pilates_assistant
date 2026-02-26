from __future__ import annotations

import json
import os
import re
from typing import Any

from openai import OpenAI

from tools.web_tools import fetch_pilates_exercises


def _normalize_workout_plan(items: list[dict[str, Any]]) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    seen: set[str] = set()

    for item in items:
        if not isinstance(item, dict):
            continue
        name = str(item.get("exercise_name", "")).strip()
        if not name:
            continue
        key = name.lower()
        if key in seen:
            continue
        seen.add(key)

        normalized.append(
            {
                "exercise_name": name,
                "sets": str(item.get("sets", "")).strip() or "3",
                "reps": str(item.get("reps", "")).strip() or "10-12",
                "clinical_reason": str(item.get("clinical_reason", "")).strip(),
            }
        )

        if len(normalized) == 5:
            break

    if len(normalized) != 5:
        raise RuntimeError("Model did not return 5 distinct exercises.")
    return normalized


def _extract_json_text(content: str) -> str:
    text = (content or "").strip()
    if not text:
        return ""

    # Handles markdown fenced blocks like ```json ... ```
    fenced = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", text, flags=re.IGNORECASE)
    if fenced:
        return fenced.group(1).strip()

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1].strip()
    return text


def _parse_model_json(content: str) -> dict[str, Any]:
    json_text = _extract_json_text(content)
    if not json_text:
        raise json.JSONDecodeError("Empty model content", content, 0)
    return json.loads(json_text)


def generate_workout_plan(student_profile: dict[str, Any], clinical_analysis: str, language: str = "en") -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    client = OpenAI(api_key=api_key)
    output_language = "Portuguese (Brazil)" if language == "pt" else "English"

    tools = [
        {
            "type": "function",
            "function": {
                "name": "fetch_pilates_exercises",
                "description": "Fetches and summarizes Pilates exercises from curated web URLs.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "urls": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Optional list of URLs to scrape. If omitted, default URLs are used.",
                        }
                    },
                    "required": [],
                    "additionalProperties": False,
                },
            },
        }
    ]

    messages: list[dict[str, Any]] = [
        {
            "role": "system",
            "content": (
                "You are a Clinical Pilates Instructor. You must FIRST call the fetch_pilates_exercises tool to read "
                "the Pilates exercises from the web. THEN prescribe exactly 5 distinct exercises based on the full "
                "patient profile and the clinical analysis. "
                f"Write the entire final workout_plan in {output_language}."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Student profile:\n{json.dumps(student_profile, ensure_ascii=False)}\n\n"
                f"Clinical analysis:\n{clinical_analysis}\n\n"
                "Return only valid JSON with this structure: "
                '{"workout_plan":[{"exercise_name":"...","sets":"...","reps":"...","clinical_reason":"..."}]}'
            ),
        },
    ]

    # Force the first assistant turn to call the scraper tool.
    force_first_tool_call = True
    seen_tool_calls: set[str] = set()
    max_iterations = 6

    for _ in range(max_iterations):
        completion = client.chat.completions.create(
            model="gpt-5-mini",
            #model="gpt-4o-mini",
            #temperature=0.2,
            messages=messages,
            tools=tools,
            response_format={"type": "json_object"} if not force_first_tool_call else None,
            tool_choice=(
                {"type": "function", "function": {"name": "fetch_pilates_exercises"}}
                if force_first_tool_call
                else "auto"
            ),
        )
        force_first_tool_call = False

        message = completion.choices[0].message
        tool_calls = message.tool_calls or []

        if not tool_calls:
            content = message.content or "{}"
            try:
                parsed = _parse_model_json(content)
            except json.JSONDecodeError as exc:
                # Retry once with explicit "no tools" and strict JSON response
                retry_messages = messages + [
                    {"role": "assistant", "content": message.content or ""},
                    {
                        "role": "user",
                        "content": (
                            "Your previous answer was invalid. Return ONLY valid JSON with this schema: "
                            '{"workout_plan":[{"exercise_name":"...","sets":"...","reps":"...","clinical_reason":"..."}]}'
                        ),
                    },
                ]
                retry = client.chat.completions.create(
                    model="gpt-5-mini",
                    #model="gpt-4o-mini",
                    #temperature=0.2,
                    messages=retry_messages,
                    response_format={"type": "json_object"},
                    tool_choice="none",
                )
                retry_content = retry.choices[0].message.content or ""
                try:
                    parsed = _parse_model_json(retry_content)
                except json.JSONDecodeError as retry_exc:
                    preview = (retry_content or "").strip()[:300]
                    raise RuntimeError(
                        f"Model returned invalid JSON after retry: {retry_exc}. Raw preview: {preview}"
                    ) from retry_exc
            raw_plan = parsed.get("workout_plan", [])
            if not isinstance(raw_plan, list):
                raise RuntimeError("Invalid workout_plan format returned by model.")
            return {"workout_plan": _normalize_workout_plan(raw_plan)}

        messages.append(
            {
                "role": "assistant",
                "content": message.content or "",
                "tool_calls": [tc.model_dump() for tc in tool_calls],
            }
        )

        for tool_call in tool_calls:
            call_sig = f"{tool_call.function.name}:{tool_call.function.arguments or ''}"
            if call_sig in seen_tool_calls:
                continue
            seen_tool_calls.add(call_sig)

            if tool_call.function.name != "fetch_pilates_exercises":
                tool_result = "Unknown tool."
            else:
                args = json.loads(tool_call.function.arguments or "{}")
                urls = args.get("urls")
                tool_result = fetch_pilates_exercises(urls=urls)

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result,
                }
            )

    raise RuntimeError("Exceeded tool-calling iterations while generating workout plan.")
