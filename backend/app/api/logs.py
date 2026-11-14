from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import SystemLog

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.get("")
def get_logs(
    level: Optional[str] = Query(None),
    limit: int = Query(100),
    db: Session = Depends(get_db)
):
    query = db.query(SystemLog)
    if level:
        query = query.filter(SystemLog.level == level.upper())
    logs = query.order_by(SystemLog.created_at.desc()).limit(limit).all()
    return logs

@router.post("/clear")
def clear_logs(db: Session = Depends(get_db)):
    db.query(SystemLog).delete()
    db.commit()
    return {"message": "Logs cleared"}
