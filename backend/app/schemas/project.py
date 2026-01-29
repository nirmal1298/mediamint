from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class ProjectBase(BaseModel):
    name: str
    key: str
    description: Optional[str] = None

# Properties to receive on creation
class ProjectCreate(ProjectBase):
    pass

# Properties to receive on update
class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    key: Optional[str] = None
    description: Optional[str] = None

# Properties to return to client
class Project(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectMemberBase(BaseModel):
    user_id: int
    role: str = "member"

class ProjectMemberCreate(ProjectMemberBase):
    pass

class ProjectMember(ProjectMemberBase):
    id: int
    project_id: int
    
    class Config:
        from_attributes = True

class ProjectMemberWithUser(ProjectMemberBase):
    id: int
    project_id: int
    user: "User"  # Forward reference to User schema
    
    class Config:
        from_attributes = True

# Import User schema for type checking
from app.schemas.user import User
ProjectMemberWithUser.model_rebuild()

