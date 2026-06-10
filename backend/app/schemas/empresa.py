from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class NaturalezaEnum(str, Enum):
    """
    Enum para tipificar la naturaleza de la empresa segun HU04
    Evita cadenas ambiguar y normaliza los valores en la base de datos
    """
    NATURAL = 'natural'
    JURIDICA = 'juridica'

class TipoDocumentoEnum(str, Enum):
    """
    Enum para tipificar el tipo de documento de la empresa segun HU04
    Soporta la diversidad de identificacion (C, NIT, CE  NUIP) en el ecosistema mult-tenant
    """
    CC = 'CC'
    NIT = 'NIT'
    CE = 'CE'
    NUIP = 'NUIP'

class EmpresaBase(BaseModel):
    """
    Esquema base que contiene los atributos compartidos para la gestion de empresas
    Alineado con el aislamiento multi-inquilino de HU05
    """
    naturaleza: NaturalezaEnum
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    razon_social: Optional[str] = None
    tipo_documento: TipoDocumentoEnum
    documento: str
    dv: Optional[int] = None
    direccion: str
    municipio: str
    departamento: str
    email: EmailStr
    telefono: str
    estado: Optional[int] = 1
    ruta_logo: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    """
    Esquema utilizado para la creacon de nuevas empresas dentro del ecosistema
    Todos los campos de la base don obligatorias en el registro inicial
    """
    pass

class EmpresaUpdate(BaseModel):
    """
    Esquema para la actualizacion parcial (PATCH/PUT) de los dats de una empresa
    Todos los campos se vuelven opcionales para permitir actualizaciones flexibles
    """
    naturaleza: Optional[NaturalezaEnum] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    razon_social: Optional[str] = None
    tipo_documento: Optional[TipoDocumentoEnum] = None
    documento: Optional[str] = None
    dv: Optional[int] = None
    direccion: Optional[str] = None
    municipio: Optional[str] = None
    departamento: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    estado: Optional[int] = None
    ruta_logo: Optional[str] = None

class EmpresaResponse(EmpresaBase):
    """
    Esquema de respuesta estructurado para retornar los datos de la empresa de forma segura
    Incluye los campos de auditoria y persistencia generados por el servidor
    """
    id: int
    creado: datetime
    modificado: Optional[datetime] = None

    # Configuración para compatibilidad estricta con Pydantic v2 y SQLAlchemy ORM
    model_config = ConfigDict(from_attributes=True)