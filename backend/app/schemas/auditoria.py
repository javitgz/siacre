from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AuditoriaResponse(BaseModel):
    id: int
    usuario_id: int
    empresa_id: int
    accion: str
    entidad: str
    detalle: Optional[str] = None
    creado: datetime
    model_config = ConfigDict(from_attributes=True)