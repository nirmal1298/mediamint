from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.project import Project, ProjectMember, Role
from app.models.user import User
from app.schemas import project as project_schema

router = APIRouter()

@router.get("/", response_model=List[project_schema.Project])
def read_projects(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve projects current user belongs to.
    """
    # For simplicity, returning all projects for now explicitly joined or owned
    # In a real app, you might want to filter by membership:
    # return db.query(Project).join(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    
    # Returning all projects for MVP visibility or specific logic
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    project_ids = [m.project_id for m in memberships]
    projects = db.query(Project).filter(Project.id.in_(project_ids)).offset(skip).limit(limit).all()
    return projects

@router.post("/", response_model=project_schema.Project)
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: project_schema.ProjectCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new project.
    """
    project = db.query(Project).filter(Project.key == project_in.key).first()
    if project:
        raise HTTPException(
            status_code=400,
            detail="The project with this key already exists.",
        )
        
    project = Project(
        name=project_in.name,
        key=project_in.key,
        description=project_in.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Add creator as maintainer
    member = ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role=Role.MAINTAINER.value
    )
    db.add(member)
    db.commit()
    
    return project

@router.get("/{id}", response_model=project_schema.Project)
def read_project(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get project by ID.
    """
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check access
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return project

@router.post("/{id}/members", response_model=project_schema.ProjectMember)
def add_project_member(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    member_in: project_schema.ProjectMemberCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Add a member to the project.
    """
    # Check if current user is maintainer
    current_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not current_member or current_member.role != Role.MAINTAINER.value:
         raise HTTPException(status_code=403, detail="Only maintainers can add members")

    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    target_user = db.query(User).filter(User.id == member_in.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == id,
        ProjectMember.user_id == member_in.user_id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member")

    member = ProjectMember(
        project_id=id,
        user_id=member_in.user_id,
        role=member_in.role
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.patch("/{id}", response_model=project_schema.Project)
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    project_in: project_schema.ProjectUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a project. Only maintainers can update.
    """
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check if current user is maintainer
    current_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not current_member or current_member.role != Role.MAINTAINER.value:
        raise HTTPException(status_code=403, detail="Only maintainers can update projects")
    
    # Update project fields
    update_data = project_in.model_dump(exclude_unset=True)
    
    # Check if key is being updated and if it conflicts
    if "key" in update_data and update_data["key"] != project.key:
        existing_project = db.query(Project).filter(Project.key == update_data["key"]).first()
        if existing_project:
            raise HTTPException(status_code=400, detail="A project with this key already exists")
    
    for field, value in update_data.items():
        setattr(project, field, value)
        
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
