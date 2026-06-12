from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.escenario import TipoEscenarioEnum

class EscenarioBase(BaseModel):
    parametro_id: int
    tipo: TipoEscenarioEnum
    selector_valor: Optional[str] = None
    rango_min: Optional[float] = None
    rango_max: Optional[float] = None
    porcentaje: float = Field(..., ge=0, le=1)

class EscenarioCreate(EscenarioBase):
    pass

class EscenarioUpdate(BaseModel):
    tipo: Optional[TipoEscenarioEnum] = None
    selector_valor: Optional[str] = None
    rango_min: Optional[float] = None
    rango_max: Optional[float] = None
    porcentaje: Optional[float] = Field(None, ge=0, le=1)
    estado: Optional[int] = None

class EscenarioResponse(EscenarioBase):
    id: int
    estado: int
    creado: datetime
    modificado: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)