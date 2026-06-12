from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.nucleo_variable import TipoVariableEnum

class NucleoVariableBase(BaseModel):
    nombre: TipoVariableEnum
    carga: float = Field(..., ge=0, le=1, description="Peso de la variable (0-1)")
    descripcion: Optional[str] = None

class NucleoVariableCreate(NucleoVariableBase):
    pass

class NucleoVariableUpdate(BaseModel):
    carga: Optional[float] = Field(None, ge=0, le=1)
    descripcion: Optional[str] = None
    estado: Optional[int] = None

class NucleoVariableResponse(NucleoVariableBase):
    id: int
    estado: int
    creado: datetime
    modificado: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)