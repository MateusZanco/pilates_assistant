from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StudentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    tax_id_cpf: str = Field(..., min_length=11, max_length=14)
    date_of_birth: date
    phone: str = Field(..., min_length=8, max_length=20)
    medical_notes: str = Field(default="")


class StudentCreate(StudentBase):
    goals: str = Field(default="")


class StudentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    tax_id_cpf: str | None = Field(default=None, min_length=11, max_length=14)
    date_of_birth: date | None = None
    phone: str | None = Field(default=None, min_length=8, max_length=20)
    medical_notes: str | None = None
    goals: str | None = None


class StudentRead(StudentBase):
    id: int
    goals: str
    latest_detected_deviations: str
    latest_clinical_analysis: str
    latest_workout_plan: str

    model_config = ConfigDict(from_attributes=True)


class InstructorBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=8, max_length=20)
    email: str = Field(..., min_length=5, max_length=120)
    specialty: str = Field(default="")
    notes: str = Field(default="")


class InstructorCreate(InstructorBase):
    pass


class InstructorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, min_length=8, max_length=20)
    email: str | None = Field(default=None, min_length=5, max_length=120)
    specialty: str | None = None
    notes: str | None = None


class InstructorRead(InstructorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class AssessmentCreate(BaseModel):
    student_id: int
    image_url: str
    postural_notes: str = ""


class AssessmentRead(AssessmentCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AppointmentBase(BaseModel):
    student_id: int
    instructor_id: int
    start_time: datetime
    end_time: datetime
    status: Literal["booked", "completed", "canceled"] = "booked"
    notes: str = ""


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    student_id: int | None = None
    instructor_id: int | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    status: Literal["booked", "completed", "canceled"] | None = None
    notes: str | None = None


class AppointmentRead(AppointmentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkoutPlanRequest(BaseModel):
    student_id: int
    language: Literal["pt", "en"] = "en"


class WorkoutExercise(BaseModel):
    exercise_name: str
    sets: str
    reps: str
    clinical_reason: str


class WorkoutPlanResponse(BaseModel):
    workout_plan: list[WorkoutExercise]
