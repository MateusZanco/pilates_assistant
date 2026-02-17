from __future__ import annotations

import asyncio
from datetime import datetime

from fastapi import Depends, FastAPI, File, HTTPException, Query, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pilates Vision & Progress API", version="0.2.0")

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
def list_students(q: str | None = Query(default=None, min_length=1), db: Session = Depends(get_db)) -> list[schemas.StudentRead]:
    query = db.query(models.Student)

    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Student.name.ilike(pattern),
                models.Student.tax_id_cpf.ilike(pattern),
                models.Student.phone.ilike(pattern),
            )
        )

    return query.order_by(models.Student.id.desc()).all()


@app.get("/students/{student_id}", response_model=schemas.StudentRead)
def get_student(student_id: int, db: Session = Depends(get_db)) -> schemas.StudentRead:
    student = db.get(models.Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.put("/students/{student_id}", response_model=schemas.StudentRead)
def update_student(student_id: int, payload: schemas.StudentUpdate, db: Session = Depends(get_db)) -> schemas.StudentRead:
    student = db.get(models.Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    updates = payload.model_dump(exclude_unset=True)
    if "tax_id_cpf" in updates:
        existing = (
            db.query(models.Student)
            .filter(models.Student.tax_id_cpf == updates["tax_id_cpf"], models.Student.id != student_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="A student with this CPF already exists")

    for key, value in updates.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return student


@app.delete("/students/{student_id}", status_code=204, response_class=Response)
def delete_student(student_id: int, db: Session = Depends(get_db)) -> Response:
    student = db.get(models.Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return Response(status_code=204)


@app.post("/instructors", response_model=schemas.InstructorRead, status_code=201)
def create_instructor(instructor: schemas.InstructorCreate, db: Session = Depends(get_db)) -> schemas.InstructorRead:
    existing = db.query(models.Instructor).filter(models.Instructor.email == instructor.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An instructor with this email already exists")

    new_instructor = models.Instructor(**instructor.model_dump())
    db.add(new_instructor)
    db.commit()
    db.refresh(new_instructor)
    return new_instructor


@app.get("/instructors", response_model=list[schemas.InstructorRead])
def list_instructors(db: Session = Depends(get_db)) -> list[schemas.InstructorRead]:
    return db.query(models.Instructor).order_by(models.Instructor.id.desc()).all()


@app.get("/instructors/{instructor_id}", response_model=schemas.InstructorRead)
def get_instructor(instructor_id: int, db: Session = Depends(get_db)) -> schemas.InstructorRead:
    instructor = db.get(models.Instructor, instructor_id)
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return instructor


@app.put("/instructors/{instructor_id}", response_model=schemas.InstructorRead)
def update_instructor(
    instructor_id: int, payload: schemas.InstructorUpdate, db: Session = Depends(get_db)
) -> schemas.InstructorRead:
    instructor = db.get(models.Instructor, instructor_id)
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    updates = payload.model_dump(exclude_unset=True)
    if "email" in updates:
        existing = db.query(models.Instructor).filter(models.Instructor.email == updates["email"], models.Instructor.id != instructor_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="An instructor with this email already exists")

    for key, value in updates.items():
        setattr(instructor, key, value)

    db.commit()
    db.refresh(instructor)
    return instructor


@app.delete("/instructors/{instructor_id}", status_code=204, response_class=Response)
def delete_instructor(instructor_id: int, db: Session = Depends(get_db)) -> Response:
    instructor = db.get(models.Instructor, instructor_id)
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    db.delete(instructor)
    db.commit()
    return Response(status_code=204)


@app.post("/appointments", response_model=schemas.AppointmentRead, status_code=201)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)) -> schemas.AppointmentRead:
    if appointment.end_time <= appointment.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    student = db.get(models.Student, appointment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    instructor = db.get(models.Instructor, appointment.instructor_id)
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    overlapping = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.instructor_id == appointment.instructor_id,
            models.Appointment.start_time < appointment.end_time,
            models.Appointment.end_time > appointment.start_time,
        )
        .first()
    )
    if overlapping:
        raise HTTPException(status_code=409, detail="Instructor already has an appointment in this time range")

    new_appointment = models.Appointment(**appointment.model_dump())
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return new_appointment


@app.get("/appointments", response_model=list[schemas.AppointmentRead])
def list_appointments(
    date: str | None = Query(default=None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
) -> list[schemas.AppointmentRead]:
    query = db.query(models.Appointment)

    if date:
        try:
            selected_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD") from exc

        query = query.filter(models.Appointment.start_time >= datetime.combine(selected_date, datetime.min.time()))
        query = query.filter(models.Appointment.start_time < datetime.combine(selected_date, datetime.max.time()))

    return query.order_by(models.Appointment.start_time.asc()).all()


@app.get("/appointments/{appointment_id}", response_model=schemas.AppointmentRead)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)) -> schemas.AppointmentRead:
    appointment = db.get(models.Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@app.put("/appointments/{appointment_id}", response_model=schemas.AppointmentRead)
def update_appointment(
    appointment_id: int, payload: schemas.AppointmentUpdate, db: Session = Depends(get_db)
) -> schemas.AppointmentRead:
    appointment = db.get(models.Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    updates = payload.model_dump(exclude_unset=True)
    next_start = updates.get("start_time", appointment.start_time)
    next_end = updates.get("end_time", appointment.end_time)
    next_instructor = updates.get("instructor_id", appointment.instructor_id)

    if next_end <= next_start:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    if "student_id" in updates and not db.get(models.Student, updates["student_id"]):
        raise HTTPException(status_code=404, detail="Student not found")

    if "instructor_id" in updates and not db.get(models.Instructor, updates["instructor_id"]):
        raise HTTPException(status_code=404, detail="Instructor not found")

    overlapping = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.id != appointment_id,
            models.Appointment.instructor_id == next_instructor,
            models.Appointment.start_time < next_end,
            models.Appointment.end_time > next_start,
        )
        .first()
    )
    if overlapping:
        raise HTTPException(status_code=409, detail="Instructor already has an appointment in this time range")

    for key, value in updates.items():
        setattr(appointment, key, value)

    db.commit()
    db.refresh(appointment)
    return appointment


@app.delete("/appointments/{appointment_id}", status_code=204, response_class=Response)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)) -> Response:
    appointment = db.get(models.Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appointment)
    db.commit()
    return Response(status_code=204)


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
