from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Properties to return via API
class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
