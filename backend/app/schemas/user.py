from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional
from datetime import datetime

# Base compartida de usuarios con todos los atributos de perfil de SIACRE
class UserBase(BaseModel):
    nombres: str = Field(..., max_length=150, description='Nombres del usuario')
    apellidos: Optional[str] = Field(None, max_length=150, description='Apellidos del usuario')
    tipo_documento: Optional[str] = Field(None, max_length=10, description='Tipo de documento de identidad')
    documento: Optional[str] = Field(None, max_length=50, description='Numero de documento del usuario')
    telefono: Optional[str] = Field(None, max_length=20, description='Telefono de contacto')
    direccion: Optional[str] = Field(None, max_length=255, description='Direccion de residencia')
    municipio: Optional[str] = Field(None, max_length=100, description='Municipio de residencia')
    departamento: Optional[str] = Field(None, max_length=100, description='Departamento de residencia')
    email: EmailStr = Field(..., description='Correo electronico de acceso')
    estado: int = Field(1, ge=0, le=1, description='Estado del rol: 1 para Activo, 0 para Inactivo (Soft Delete)')
    rol_id: int = Field(..., description='ID del rol asignado (FK)')

# Esquema estricto para la creacion (HU06): Requiere contraseña y el inquilino (empresa) obligatoriamente
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description='Contraseña en texto plano para ser procesada por Bcrypt')
    empresa_id: int = Field(..., description="ID de la empresa de pertenencia (Clave de aislamiento Multi-Tenant)")

# Esquema para actualizacion parcial de datos
class UserUpdate(BaseModel):
    nombres: Optional[str] = Field(None, max_length=150)
    apellidos: Optional[str] = Field(None, max_length=150)
    tipo_documento: Optional[str] = Field(None, max_length=10)
    documento: Optional[str] = Field(None, max_length=50)
    telefono: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = Field(None, max_length=255)
    municipio: Optional[str] = Field(None, max_length=100)
    departamento: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    estado: Optional[int] = Field(None, ge=0, le=1)
    rol_id: Optional[int] = None
    empresa_id: Optional[int] = None

# Esquema de respuesta para capas externas / endpoints
class UserResponse(UserBase):
    id: int
    empresa_id: int
    creado: datetime
    modificado: Optional[datetime] = None
    rol_nombre: Optional[str] = Field(None, description="Nombre descriptivo del rol resuelto en la consulta")

    model_config = ConfigDict(from_attributes=True)