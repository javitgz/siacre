from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PermisoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class PermisoCreate(PermisoBase):
    pass

class PermisoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None

class PermisoResponse(PermisoBase):
    id: int
    estado: int
    creado: datetime
    modificado: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)