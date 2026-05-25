from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class RoleBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: Optional[int] = 1

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int
    creado: datetime

    model_config = ConfigDict(from_attributes=True)