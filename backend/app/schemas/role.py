from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

# Esquema para la visualizacion/anidacion de permisos dentro de un rol
class PermisoRelacionResponse(BaseModel):
    id: int
    nombre: str
    estado: int

    model_config = ConfigDict(from_attributes=True)

# Base compartida de Roles
class RoleBase(BaseModel):
    nombre: str = Field(..., max_length=100, description='Nombre unico del rol (ej. administrador, coordinador, analista)')
    descripcion: Optional[str] = Field(None, description='Descripción detallada de las respondabilidades del rol')
    estado: Optional[int] = Field(1, ge=0, le=1, description='Estado del rol: 1 para Activo, 0 para Inactivo (Soft Delete)')

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    descripcion: Optional[str] = None
    estado: Optional[int] = Field(None, ge=0, le=1)

# Esquema de respuesta completo
class RoleResponse(RoleBase):
    id: int
    creado: datetime
    modificado: Optional[datetime] = None
    # Representacion normalizada de los permisos heradados mediante la relacion roles_permisos
    permisos: List[PermisoRelacionResponse] = []

    model_config = ConfigDict(from_attributes=True)