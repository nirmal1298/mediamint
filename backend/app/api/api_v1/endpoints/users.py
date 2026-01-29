from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas import user as user_schema
from app.models import User

router = APIRouter()

@router.get("/me", response_model=user_schema.User)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/", response_model=List[user_schema.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve all users with pagination.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

