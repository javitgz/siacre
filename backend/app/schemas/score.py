from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict
from datetime import datetime

class ScoreBase(BaseModel):
    puntaje_maximo: int = 1000
    distribucion: Optional[Dict[str, float]] = None

class ScoreCreate(ScoreBase):
    pass

class ScoreUpdate(BaseModel):
    puntaje_maximo: Optional[int] = None
    distribucion: Optional[Dict[str, float]] = None
    estado: Optional[int] = None

class ScoreResponse(ScoreBase):
    id: int
    estado: int
    creado: datetime
    modificado: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)