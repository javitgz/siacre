from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class RoleBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: Optional[int] = 1
    permisos: Optional[Dict[str, bool]]={
        'dashboard': True,
        'clientes': False,
        'parametros': False,
        'reportes': False,
        'configuracion': False,
        'usuarios': False,
        'roles': False,
        'auditoria': False
    }

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int
    creado: datetime

    model_config = ConfigDict(from_attributes=True)