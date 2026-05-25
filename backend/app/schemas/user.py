from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    nombre: str
    email: str
    estado: Optional[int] = 1
    rol_id: int

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    creado: datetime

    model_config = ConfigDict(from_attributes=True)