from __future__ import annotations

import asyncio

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pilates Vision & Progress API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/students", response_model=schemas.StudentRead, status_code=201)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)) -> schemas.StudentRead:
    existing = db.query(models.Student).filter(models.Student.tax_id_cpf == student.tax_id_cpf).first()
    if existing:
        raise HTTPException(status_code=400, detail="A student with this CPF already exists")

    new_student = models.Student(**student.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


@app.get("/students", response_model=list[schemas.StudentRead])
def list_students(db: Session = Depends(get_db)) -> list[schemas.StudentRead]:
    return db.query(models.Student).order_by(models.Student.id.desc()).all()


@app.post("/assessments", response_model=schemas.AssessmentRead, status_code=201)
def create_assessment(assessment: schemas.AssessmentCreate, db: Session = Depends(get_db)) -> schemas.AssessmentRead:
    student = db.get(models.Student, assessment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_assessment = models.Assessment(**assessment.model_dump())
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    return new_assessment


@app.post("/analyze")
async def analyze_posture(image: UploadFile = File(...)) -> dict[str, object]:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    await asyncio.sleep(3)
    return {
        "status": "success",
        "deviations": ["Mild Scoliosis", "Forward Head Posture", "Shoulder Protraction"],
        "score": 78,
    }
