from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.naturaleza import NaturalezaEnum

class NaturalezaBase(BaseModel):
    nombre: NaturalezaEnum
    descripcion: Optional[str] = None

class NaturalezaCreate(NaturalezaBase):
    pass

class NaturalezaUpdate(BaseModel):
    nombre: Optional[NaturalezaEnum] = None
    descripcion: Optional[str] = None

class NaturalezaResponse(NaturalezaBase):
    id: int
    estado: int
    creado: datetime
    modificado: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)