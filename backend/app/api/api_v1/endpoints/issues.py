from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.issue import Issue, IssueStatus, IssuePriority
from app.models.project import Project, ProjectMember
from app.models.user import User
from app.schemas import issue as issue_schema

router = APIRouter()

@router.get("/", response_model=issue_schema.IssueListResponse)
def read_issues(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    status: Optional[IssueStatus] = None,
    priority: Optional[IssuePriority] = None,
    assignee_id: Optional[int] = None,
) -> Any:
    """
    Retrieve issues with pagination.
    """
    query = db.query(Issue)
    
    if project_id:
        # Check access to project
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        query = query.filter(Issue.project_id == project_id)
    else:
        # Filter issues from projects user is a member of
        user_project_ids = db.query(ProjectMember.project_id).filter(ProjectMember.user_id == current_user.id).subquery()
        query = query.filter(Issue.project_id.in_(user_project_ids))

    if status:
        query = query.filter(Issue.status == status)
    if priority:
        query = query.filter(Issue.priority == priority)
    if assignee_id:
        query = query.filter(Issue.assignee_id == assignee_id)

    total = query.count()
    issues = query.offset(skip).limit(limit).all()
    
    return {
        "items": issues,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("/", response_model=issue_schema.Issue)
def create_issue(
    *,
    db: Session = Depends(deps.get_db),
    issue_in: issue_schema.IssueCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new issue.
    """
    # Check project access
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == issue_in.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    issue = Issue(
        **issue_in.model_dump(),
        reporter_id=current_user.id
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue

@router.get("/{id}", response_model=issue_schema.Issue)
def read_issue(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get issue by ID.
    """
    issue = db.query(Issue).filter(Issue.id == id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    # Check access to project
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == issue.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return issue

@router.patch("/{id}", response_model=issue_schema.Issue)
def update_issue(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    issue_in: issue_schema.IssueUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update an issue.
    """
    issue = db.query(Issue).filter(Issue.id == id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    # Check access to project
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == issue.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Check if user has permission to update this issue
    if not deps.check_issue_permission(db, issue, current_user, "update"):
        raise HTTPException(
            status_code=403,
            detail="You can only update issues you reported unless you are a project maintainer"
        )
    
    update_data = issue_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(issue, field, value)
        
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue
