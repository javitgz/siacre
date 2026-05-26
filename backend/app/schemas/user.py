from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime

# Base para creación y actualización
class UserBase(BaseModel):
    nombre: str
    apellidos: Optional[str] = None
    tipo_documento: Optional[str] = None
    documento: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    municipio: Optional[str] = None
    departamento: Optional[str] = None
    email: EmailStr
    estado: Optional[int] = 1
    rol_id: int

class UserCreate(UserBase):
    password: str

# Respuesta (tambien con el nombre del rol)
class UserResponse(UserBase):
    id: int
    creado: datetime
    rol_nombre: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)