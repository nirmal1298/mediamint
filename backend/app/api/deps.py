from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import SessionLocal
from app.models import User
from app.schemas import user as user_schema

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = user_schema.TokenData(id=payload.get("sub"))
        if token_data.id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(token_data.id)).first()
    if user is None:
        raise credentials_exception
    return user

def check_issue_permission(
    db: Session,
    issue,  # Issue model
    user: User,
    action: str = "update"
) -> bool:
    """
    Check if user has permission to perform action on issue.
    
    Args:
        db: Database session
        issue: Issue instance
        user: Current user
        action: Action to perform (update, delete, etc.)
    
    Returns:
        bool: True if user has permission, False otherwise
    """
    from app.models.project import ProjectMember, Role
    
    # Check if user is project member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == issue.project_id,
        ProjectMember.user_id == user.id
    ).first()
    
    if not member:
        return False
    
    # Project maintainers can do anything
    if member.role == Role.MAINTAINER:
        return True
    
    # Regular users can only update their own issues
    if action in ["update", "delete"]:
        return issue.reporter_id == user.id
    
    # For other actions (like viewing), being a member is enough
    return True

def check_project_maintainer(
    db: Session,
    project_id: int,
    user: User
) -> bool:
    """
    Check if user is a maintainer of the project.
    
    Args:
        db: Database session
        project_id: Project ID
        user: Current user
    
    Returns:
        bool: True if user is maintainer, False otherwise
    """
    from app.models.project import ProjectMember, Role
    
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id,
        ProjectMember.role == Role.MAINTAINER
    ).first()
    
    return member is not None

