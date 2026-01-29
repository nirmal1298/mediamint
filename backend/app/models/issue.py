from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

import enum

class IssueStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class IssuePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Issue(Base):
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default=IssueStatus.OPEN, index=True)
    priority = Column(String, default=IssuePriority.MEDIUM, index=True)
    
    reporter_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="issues")
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_issues")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_issues")
    comments = relationship("Comment", back_populates="issue", cascade="all, delete-orphan")
