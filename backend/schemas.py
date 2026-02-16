from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class StudentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    tax_id_cpf: str = Field(..., min_length=11, max_length=14)
    date_of_birth: date
    phone: str = Field(..., min_length=8, max_length=20)
    medical_notes: str = Field(default="")


class StudentCreate(StudentBase):
    goals: str = Field(default="")


class StudentRead(StudentBase):
    id: int
    goals: str

    model_config = ConfigDict(from_attributes=True)


class AssessmentCreate(BaseModel):
    student_id: int
    image_url: str
    postural_notes: str = ""


class AssessmentRead(AssessmentCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
