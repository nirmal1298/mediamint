from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class Role(str, enum.Enum):
    MAINTAINER = "maintainer"
    MEMBER = "member"

class Project(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    key = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="project", cascade="all, delete-orphan")

class ProjectMember(Base):
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    role = Column(String, default=Role.MEMBER, nullable=False) # Storing generic string to avoid enum issues, or use SQLEnum

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")
