from __future__ import annotations

from typing import Iterable

import requests
from bs4 import BeautifulSoup


PILATES_SOURCE_URLS = [
    "https://blogpilates.com.br/34-exercicios-originais-de-pilates/",
    "https://blogpilates.com.br/lista-exercicios-de-pilates/",
]


def _extract_relevant_lines(text: str, max_lines: int = 90) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned = [line for line in lines if len(line) > 20]
    return "\n".join(cleaned[:max_lines])


def _fetch_url_text(url: str, timeout: int = 20) -> str:
    response = requests.get(url, timeout=timeout, headers={"User-Agent": "PilatesVisionProgressBot/1.0"})
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.extract()

    raw_text = soup.get_text(separator="\n")
    return _extract_relevant_lines(raw_text)


def fetch_pilates_exercises(urls: Iterable[str] | None = None) -> str:
    target_urls = list(urls) if urls else PILATES_SOURCE_URLS
    if not target_urls:
        return "No URLs provided."

    chunks: list[str] = []
    for url in target_urls:
        try:
            content = _fetch_url_text(url)
            chunks.append(f"Source: {url}\n{content}")
        except Exception as exc:
            chunks.append(f"Source: {url}\nError fetching content: {exc}")

    combined = "\n\n".join(chunks)
    max_chars = 14000
    if len(combined) > max_chars:
        combined = combined[:max_chars] + "\n\n[truncated]"
    return combined
