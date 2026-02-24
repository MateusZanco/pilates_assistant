FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:/app/backend

RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY app/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/backend/ /app/backend/
COPY agents/ /app/agents/
COPY tools/ /app/tools/
COPY prompts/ /app/prompts/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
