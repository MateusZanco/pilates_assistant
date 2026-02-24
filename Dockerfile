FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY app/frontend/package.json ./
RUN npm install
COPY app/frontend/ ./
RUN npm run build

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860
ENV DATABASE_URL=sqlite:////data/pilates_vision_progress.db
ENV PYTHONPATH=/app:/app/backend

RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend
COPY app/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/backend/ ./
COPY agents/ /app/agents/
COPY tools/ /app/tools/
COPY prompts/ /app/prompts/
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 7860
VOLUME ["/data"]

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]

