from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.comment import Comment
from app.models.issue import Issue
from app.models.project import ProjectMember
from app.models.user import User
from app.schemas import comment as comment_schema

router = APIRouter()

@router.get("/issue/{issue_id}", response_model=List[comment_schema.Comment])
def read_comments(
    *,
    db: Session = Depends(deps.get_db),
    issue_id: int,
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve comments for a specific issue.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    # Check access to project
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == issue.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    comments = db.query(Comment).filter(Comment.issue_id == issue_id).offset(skip).limit(limit).all()
    return comments

@router.post("/issue/{issue_id}", response_model=comment_schema.Comment)
def create_comment(
    *,
    db: Session = Depends(deps.get_db),
    issue_id: int,
    comment_in: comment_schema.CommentCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new comment.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    # Check access to project
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == issue.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    comment = Comment(
        **comment_in.model_dump(),
        issue_id=issue_id,
        author_id=current_user.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
