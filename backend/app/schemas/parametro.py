from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.parametro import TipoMedicionEnum

class ParametroBase(BaseModel):
    codigo: str = Field(..., max_length=50)
    nombre: str = Field(..., max_length=100)
    caracteristica_medida: Optional[str] = None
    tipo: TipoMedicionEnum
    puntos_maximos: float = Field(..., ge=0)
    interpretacion: Optional[str] = None
    nucleo_id: int
    naturaleza_id: int

class ParametroCreate(ParametroBase):
    pass

class ParametroUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    caracteristica_medida: Optional[str] = None
    tipo: Optional[TipoMedicionEnum] = None
    puntos_maximos: Optional[float] = Field(None, ge=0)
    interpretacion: Optional[str] = None
    nucleo_id: Optional[int] = None
    naturaleza_id: Optional[int] = None
    estado: Optional[int] = None

class ParametroResponse(ParametroBase):
    id: int
    estado: int
    creado: datetime
    modificado: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)