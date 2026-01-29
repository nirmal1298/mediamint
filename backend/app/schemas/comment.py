from pydantic import BaseModel
from datetime import datetime

# Shared properties
class CommentBase(BaseModel):
    body: str

# Properties to receive on creation
class CommentCreate(CommentBase):
    pass

# Properties to return to client
class Comment(CommentBase):
    id: int
    issue_id: int
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True
