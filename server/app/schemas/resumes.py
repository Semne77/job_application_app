from datetime import datetime
from pydantic import BaseModel

class ResumeOut(BaseModel):
    id: int
    filename: str
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True  # allow ORM objects -> Pydantic
