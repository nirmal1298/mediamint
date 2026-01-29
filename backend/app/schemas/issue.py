from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.issue import IssueStatus, IssuePriority

# Shared properties
class IssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: IssueStatus = IssueStatus.OPEN
    priority: IssuePriority = IssuePriority.MEDIUM
    assignee_id: Optional[int] = None

# Properties to receive on creation
class IssueCreate(IssueBase):
    project_id: int

# Properties to receive on update
class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[IssueStatus] = None
    priority: Optional[IssuePriority] = None
    assignee_id: Optional[int] = None

# Properties to return to client
class Issue(IssueBase):
    id: int
    project_id: int
    reporter_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Paginated response
class IssueListResponse(BaseModel):
    items: List[Issue]
    total: int
    skip: int
    limit: int
