from pathlib import Path
from time import time
from datetime import datetime

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Resume, User
from app.schemas.resumes import ResumeOut
from app.core.auth import get_current_user  # returns User row

router = APIRouter(prefix="/resumes", tags=["resumes"])

# uploads directory at project root (…/server/uploads)
UPLOAD_DIR = (Path(__file__).resolve().parents[2] / "uploads").resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # already a User row
):
    # allow only safe formats
    allowed = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
        "application/msword",  # .doc
        "text/plain",
    }
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}",
        )

    # unique filename
    original = Path(file.filename).name
    unique = f"{current_user.id}_{int(time())}_{original}"
    dest_path = UPLOAD_DIR / unique

    # write file
    data = await file.read()
    dest_path.write_bytes(data)

    # persist record
    rec = Resume(
        user_id=current_user.id,
        filename=original,
        file_path=str(dest_path),
        uploaded_at=datetime.utcnow(),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return rec


@router.get("", response_model=list[ResumeOut])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )
    return rows


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Resume not found")
    return rec


@router.get("/{resume_id}/download")
def download_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Resume not found")

    path = Path(rec.file_path)
    if not path.exists():
        raise HTTPException(status_code=410, detail="File on disk is missing")

    return FileResponse(path, filename=rec.filename, media_type="application/octet-stream")


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Resume not found")

    # try deleting file
    try:
        Path(rec.file_path).unlink(missing_ok=True)
    except Exception:
        pass

    db.delete(rec)
    db.commit()
    return None
