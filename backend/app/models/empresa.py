from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class NaturalezaEnum(str, enum.Enum):
    natural = "natural"
    juridica = "juridica"

class TipoDocumentoEnum(str, enum.Enum):
    cc = 'CC'
    nit = 'NIT'
    ce = 'CE'
    nuip = 'NUIP'

class Empresa(Base):
    """
    TABLA: empresa (HU04 / HU05)
    Entidad nucleo para el aislamiento de datos dentro del entorno multi-tenant (SaaS).
    Soporta diferenciación legal entre personas naturales y jurídicas.
    """
    __tablename__= 'empresas'

    id = Column(Integer, primary_key=True, index=True)
    naturaleza = Column(Enum(NaturalezaEnum), nullable=False, default=NaturalezaEnum.juridica)
    nombres = Column(String(150), nullable=True)
    apellidos = Column(String(150), nullable=True)
    razon_social = Column(String(150), nullable=True)
    tipo_documento = Column(Enum(TipoDocumentoEnum), nullable=False, default=TipoDocumentoEnum.nit)
    documento = Column(String(20), unique=True, index=True, nullable=False)
    dv = Column(Integer, nullable=True)
    direccion = Column(String(150), nullable=False)
    municipio = Column(String(150), nullable=False)
    departamento = Column(String(150), nullable=False)
    email = Column(String(50), nullable=False)
    telefono = Column(String(25), nullable=False)
    estado = Column(Integer, default=1) # inactivo = 0, activo = 1
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())
    ruta_logo = Column(String(255), nullable=True)
    # Relacion ORM para vincular los usuarios pertenecientes a cada empresa
    usuarios = relationship("User", back_populates="empresa")


